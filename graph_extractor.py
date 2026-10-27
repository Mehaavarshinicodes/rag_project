import re
from collections import Counter, defaultdict
from typing import Dict, List, Any, Optional
import chromadb
import os

STOP_WORDS = {
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'which',
    'they', 'what', 'their', 'will', 'would', 'there', 'about', 'when', 'make',
    'like', 'time', 'just', 'know', 'take', 'person', 'into', 'year', 'your',
    'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
    'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after',
    'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
    'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are',
    'was', 'were', 'been', 'has', 'had', 'does', 'did', 'page', 'notes', 'table'
}

def extract_concepts_from_text(text: str, max_concepts: int = 5) -> List[str]:
    """
    Extracts key technical concepts and capitalized phrases from text.
    """
    candidates = []
    
    # 1. Acronyms & technical abbreviations (e.g., LLM, SLM, RAG, GPU, LPU, API, JVM)
    acronyms = re.findall(r'\b[A-Z]{2,6}\b', text)
    for ac in acronyms:
        if ac.lower() not in STOP_WORDS and len(ac) >= 2:
            candidates.append(ac)
            
    # 2. Capitalized phrases or titles (e.g. "Language Models", "Reference Types", "Memory Allocation")
    capitalized_phrases = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b', text)
    for phrase in capitalized_phrases:
        if len(phrase.split()) <= 3 and phrase.lower() not in STOP_WORDS:
            candidates.append(phrase)

    # 3. Quoted terms or parenthesized terms
    quoted = re.findall(r'["\']([A-Za-z\s]{3,25})["\']', text)
    for q in quoted:
        q_clean = q.strip()
        if len(q_clean.split()) <= 3 and q_clean.lower() not in STOP_WORDS:
            candidates.append(q_clean.title())

    # 4. Frequent technical 2-grams
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i+1]
        if w1 not in STOP_WORDS and w2 not in STOP_WORDS:
            pair = f"{w1} {w2}".title()
            # check if repeated
            candidates.append(pair)

    # Count frequencies
    counter = Counter(candidates)
    # Pick top meaningful concepts
    top_concepts = [item[0] for item in counter.most_common(max_concepts)]
    return top_concepts

def build_knowledge_graph(persist_base_dir: str, target_doc: Optional[str] = None) -> Dict[str, Any]:
    nodes = []
    edges = []
    node_ids = set()

    # Determine which documents to load
    doc_dirs = []
    if os.path.exists(persist_base_dir):
        if target_doc and os.path.isdir(os.path.join(persist_base_dir, target_doc)):
            doc_dirs = [target_doc]
        else:
            doc_dirs = [
                d for d in os.listdir(persist_base_dir) 
                if os.path.isdir(os.path.join(persist_base_dir, d))
            ]

    # Global tracking of concepts across chunks
    concept_occurrences = defaultdict(list) # concept -> list of chunk_ids
    concept_docs = defaultdict(set) # concept -> set of doc_names
    concept_snippets = {}

    for doc_name in doc_dirs:
        doc_path = os.path.join(persist_base_dir, doc_name)
        try:
            client = chromadb.PersistentClient(path=doc_path)
            # Find collection
            cols = client.list_collections()
            if not cols:
                continue
            collection = cols[0]
            data = collection.get()
            
            chunk_ids = data.get("ids", [])
            chunk_texts = data.get("documents", [])
            metadatas = data.get("metadatas", []) or [{}] * len(chunk_ids)

            if not chunk_ids:
                continue

            clean_doc_label = doc_name.replace("_", " ").replace("-", " ").title()
            doc_node_id = f"doc_{doc_name}"
            
            # 1. Add Document Node
            if doc_node_id not in node_ids:
                nodes.append({
                    "id": doc_node_id,
                    "label": clean_doc_label,
                    "type": "document",
                    "document": doc_name,
                    "page_count": max([m.get("page", 0) for m in metadatas if isinstance(m, dict)] or [0]) + 1,
                    "chunk_count": len(chunk_ids),
                    "excerpt": f"Document with {len(chunk_ids)} indexed text chunks in ChromaDB.",
                    "size": 24,
                    "color": "#06b6d4" # Radiant Cyan
                })
                node_ids.add(doc_node_id)

            # Limit chunks in the graph if too large for fluid rendering (e.g., max 30 chunks per doc)
            sample_step = max(1, len(chunk_ids) // 30)
            sampled_indices = list(range(0, len(chunk_ids), sample_step))

            for idx in sampled_indices:
                cid = chunk_ids[idx]
                text = chunk_texts[idx]
                meta = metadatas[idx] if idx < len(metadatas) and isinstance(metadatas[idx], dict) else {}
                page_num = meta.get("page", idx + 1)
                
                chunk_node_id = f"chunk_{doc_name}_{idx}"
                chunk_label = f"Chunk #{idx+1} (p.{page_num})"
                
                # 2. Add Chunk Node
                if chunk_node_id not in node_ids:
                    nodes.append({
                        "id": chunk_node_id,
                        "label": chunk_label,
                        "type": "chunk",
                        "document": doc_name,
                        "page": page_num,
                        "chunk_id": cid,
                        "excerpt": (text[:220] + "...").replace("\n", " "),
                        "full_text": text,
                        "size": 8,
                        "color": "#94a3b8" # Slate
                    })
                    node_ids.add(chunk_node_id)

                # Edge: Document -> Chunk
                edges.append({
                    "id": f"e_{doc_node_id}_{chunk_node_id}",
                    "source": doc_node_id,
                    "target": chunk_node_id,
                    "relationship": "contains",
                    "color": "rgba(6, 182, 212, 0.25)"
                })

                # Extract concepts from this chunk
                chunk_concepts = extract_concepts_from_text(text, max_concepts=3)
                for c in chunk_concepts:
                    c_clean = c.strip()
                    if len(c_clean) < 3 or c_clean.lower() in STOP_WORDS:
                        continue
                    concept_occurrences[c_clean].append(chunk_node_id)
                    concept_docs[c_clean].add(doc_name)
                    if c_clean not in concept_snippets:
                        concept_snippets[c_clean] = text[:200].replace("\n", " ")

        except Exception as e:
            print(f"Error loading Chroma collection for {doc_name}: {e}")
            continue

    # Filter concepts that appear meaningfully
    # Keep concepts that appear in at least 1 or 2 chunks
    for concept, c_chunk_ids in concept_occurrences.items():
        if len(concept) < 3:
            continue
        c_slug = re.sub(r'[^a-zA-Z0-9]', '_', concept).lower()
        concept_node_id = f"concept_{c_slug}"

        if concept_node_id not in node_ids:
            # Scale size based on degree/frequency
            node_size = min(20, 10 + len(c_chunk_ids) * 2)
            nodes.append({
                "id": concept_node_id,
                "label": concept,
                "type": "concept",
                "document": list(concept_docs[concept])[0] if concept_docs[concept] else "",
                "frequency": len(c_chunk_ids),
                "excerpt": concept_snippets.get(concept, f"Key topic identified across {len(c_chunk_ids)} chunks."),
                "size": node_size,
                "color": "#818cf8" # Glowing Indigo / Violet
            })
            node_ids.add(concept_node_id)

        # Connect Chunk -> Concept
        for ch_id in c_chunk_ids[:4]: # avoid cluttering, connect to up to 4 chunks
            edge_id = f"e_{ch_id}_{concept_node_id}"
            edges.append({
                "id": edge_id,
                "source": ch_id,
                "target": concept_node_id,
                "relationship": "mentions",
                "color": "rgba(129, 140, 248, 0.25)"
            })

    # Concept -> Concept co-occurrence edges
    # Connect concepts that appear in the same chunk
    co_occurrences = Counter()
    for chunk_id in [n["id"] for n in nodes if n["type"] == "chunk"]:
        # Find concepts linked to this chunk
        linked_concepts = [
            e["target"] for e in edges 
            if e["source"] == chunk_id and e["relationship"] == "mentions"
        ]
        if len(linked_concepts) >= 2:
            for i in range(len(linked_concepts)):
                for j in range(i + 1, len(linked_concepts)):
                    pair = tuple(sorted([linked_concepts[i], linked_concepts[j]]))
                    co_occurrences[pair] += 1

    for (c1, c2), count in co_occurrences.most_common(50):
        if count >= 1 and c1 in node_ids and c2 in node_ids:
            edges.append({
                "id": f"e_{c1}_{c2}",
                "source": c1,
                "target": c2,
                "relationship": "related_to",
                "color": "rgba(168, 85, 247, 0.35)", # Violet
                "weight": count
            })

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "documents_count": len([n for n in nodes if n["type"] == "document"]),
            "concepts_count": len([n for n in nodes if n["type"] == "concept"]),
            "chunks_count": len([n for n in nodes if n["type"] == "chunk"]),
            "total_edges": len(edges)
        }
    }
