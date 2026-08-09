from langchain_ollama import ChatOllama
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

import os
import streamlit as st

st.title(" 🤖RAG Project ")

# uploaded_file = st.file_uploader(
#     "Upload a PDF",
#     type=["pdf"]
# )
# Store conversation history across Streamlit reruns
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

#-------------------------------------------------------
# llm = ChatOllama(
#     model="llama3.2"
# )

# response = llm.invoke("Who are you?")

# print(response.content)


# loading the documents
# loader = PyPDFLoader("data/Java_Notes.pdf")
# documents = loader.load()
# #print(documents[0]) # prints the first document


# #chunking
# text_splitter = RecursiveCharacterTextSplitter(
#     chunk_size=500,
#     chunk_overlap=100
# )
# chunks = text_splitter.split_documents(documents)
#print("Number of pages:", len(documents))
#print("Number of chunks:", len(chunks))
#print(chunks[0]) # prints the first chunk


#creating the embedding model
#------------------------------------------------------------------
def get_vector_store():
    embedding_model = OllamaEmbeddings(
        model="nomic-embed-text"
    )


    #storing in chroma db- the commented part creates the embeddings everytime the code runs which takes a lot of time
    # vector_store = Chroma.from_documents(
    #     documents=chunks,
    #     embedding=embedding_model,
    #     persist_directory="chroma_db" #folder name where the embeddings get stored
    # )


    #this checks if the embedding already exists. if so, it loads it. else a new file is created,the document loader and textsplitter is carried on and the vectors are stored. note how we use 2 different chromadb functions
    if os.path.exists("chroma_db"):
        print("Loading existing ChromaDB...")

        vector_store = Chroma(
            persist_directory="chroma_db",
            embedding_function=embedding_model
        )

    else:
        print("Creating ChromaDB...")

        loader = PyPDFLoader("data/Java_Notes.pdf")
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100
        )

        chunks = text_splitter.split_documents(documents)

        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=embedding_model,
            persist_directory="chroma_db"
        )

    return vector_store

#---------------------------------------------------
def rewrite_question(question,chat_history,llm,rewrite_prompt):
    if chat_history: #this checks if we have chat history and uses the prompt required for it else, we simply use the question
        history_text = "\n".join(
        f"{role}: {message}"
        for role, message in chat_history)

        rewrite_prompt_formatted = rewrite_prompt.invoke({
            "chat_history": history_text,
            "question": question
        })

        rewritten_question = llm.invoke(
            rewrite_prompt_formatted
        ).content

    else:
        rewritten_question=question

    return rewritten_question


#----------------------------------------------------------------

def get_answer(question,retriever,llm,prompt):
        docs = retriever.invoke(question)
        context = "\n\n".join(
            doc.page_content for doc in docs
        )
        formatted_prompt = prompt.invoke(
            {
                "context": context,
                "question": question
            }
        )   
        response = llm.invoke(formatted_prompt)
        
        return response.content

#------------------------------------------------------------------------


vector_store=get_vector_store()

#retrieval
retriever = vector_store.as_retriever(
    search_kwargs={"k": 3}
)

#testing retriever
#results = retriever.invoke("What are reference types?")
#print(results)   #prints relevant documents retrieved


#importing the llm
llm = ChatOllama(
    model="llama3.2"
)


#creating the prompt
prompt = ChatPromptTemplate.from_template("""
You are a helpful assistant.

Answer ONLY using the provided context.

If the answer is not present in the context,
say "I don't know."

Context:
{context}

Question:
{question}

Answer:
""")
#for rag-memory
rewrite_prompt = ChatPromptTemplate.from_template("""
Given the conversation history and the user's latest question,
rewrite the latest question as a standalone question.

The standalone question should be understandable without
the conversation history.

Conversation history:
{chat_history}

Latest question:
{question}

Standalone question:
""")

#keep a record of the previous questions and answers
#chat_history=[]    not used if we use streamlit



#the below commented block of code was used before using streamlit
#while True:   #while loop to keep a conversation until iser types 'exit'
    
    # question = input("\nYou: ")

    # if question.lower() == "exit":
    #     print("Exiting...")
    #     break
    

    # rewritten_question=rewrite_question(question,chat_history,llm,rewrite_prompt)

    # #retriever
    # answer=get_answer(rewritten_question,retriever,llm,prompt)
    
    # chat_history.append(("Human", question))
    # chat_history.append(("AI", answer))
    # print("\nBot: ",answer)
    # #print("Rewritten: ",rewritten_question) this shows how the probing ambiguous question gets rewritten

question = st.chat_input("Ask something about Java...")

if question:
    rewritten_question = rewrite_question(
        question,
        st.session_state.chat_history,
        llm,
        rewrite_prompt
    )

    answer = get_answer(
        rewritten_question,
        retriever,
        llm,
        prompt
    )

    st.session_state.chat_history.append(
        ("Human", question)
    )

    st.session_state.chat_history.append(
        ("AI", answer)
    )

for role, message in st.session_state.chat_history:

    if role == "Human":
        with st.chat_message("user"):
            st.write(message)

    else:
        with st.chat_message("assistant"):
            st.write(message)
#print(answer)