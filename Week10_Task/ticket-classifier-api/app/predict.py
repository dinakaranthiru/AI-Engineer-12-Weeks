import re
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
 
nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
 
STOPWORDS = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()
 
# Load the artifacts ONCE when the module is imported (not per-request)
model = joblib.load("model/ticket_classifier.pkl")
vectorizer = joblib.load("model/tfidf_vectorizer.pkl")
 
 
def clean_text(text: str) -> str:
    """Same cleaning steps used during training: strip non-letters,
    lowercase, remove stopwords, lemmatize as verbs."""
    text = re.sub("[^a-zA-Z]", " ", text)
    text = text.lower()
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(w, pos="v") for w in tokens if w not in STOPWORDS]
    return " ".join(tokens)
 
 
def predict_category(text: str):
    cleaned = clean_text(text)
    vector = vectorizer.transform([cleaned])
    prediction = model.predict(vector)[0]
    confidence = float(model.predict_proba(vector).max())
    return prediction, round(confidence, 3)
