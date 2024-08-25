import sys
from transformers import pipeline

# Check if the required argument is provided
if len(sys.argv) < 2:
    print("Usage: python mood_analysis.py <text>")
    sys.exit(1)

# Get the text from the command-line argument
text = sys.argv[1]

# Initialize the emotion analysis pipeline
classifier = pipeline('text-classification', model='bhadresh-savani/distilbert-base-uncased-emotion')

# Analyze the emotions of the provided text
result = classifier(text)

# Print the mood result
print(result[0]['label'])
