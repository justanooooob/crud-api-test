import requests
import numpy as np
import cv2
from PIL import Image
import json
import sys

url = sys.argv[1]



def preprocess(image, mean=0.5, std=0.5, shape=(299, 299)):
    """Scale, normalize and resize images."""
    image = image / 255.0  # Scale
    image = (image - mean) / std  # Normalize
    image = resize_image(image, shape)  # Resize
    return image

def resize_image(image, shape):
    """Resize the image using the PIL library."""
    image = Image.fromarray(np.uint8(image * 255.0))
    image = image.resize(shape, resample=Image.BILINEAR)
    image = np.array(image) / 255.0
    return image

def predict_labels():
    my_file = open("/var/www/Heiwan/label.txt", "r")
      
    # reading the file
    data = my_file.read()
    data_into_list = data.split("\n")
    my_file.close()

    labels = data_into_list


    # Set the model's prediction endpoint
    endpoint = 'http://heiwan-api.app:8501/v1/models/heiwan:predict'  # Replace with your endpoint


    # Load and preprocess the image
    image = cv2.imread(url)
    if image is None:
        print("Failed to load the image")
        sys.exit(1)
        
    preprocess_img = preprocess(image)
    # Perform any necessary preprocessing steps on the image

    # Convert the image to float32 and normalize pixel values
    preprocess_img = image.astype(np.float32) / 255.0

    # Create the payload for the request
    payload = {
        'instances': [{'input_2': preprocess_img.tolist()}]
    }

    response = requests.post(endpoint, json=payload)

    if response.status_code == 200:
        predictions = response.json()['predictions']

        # Define your label names based on your model's output  # Replace with your actual label names
        # Get the predicted labels
        predicted_labels = [labels[np.argmax(pred)] for pred in predictions]
        result = predicted_labels

    else:
        result = 'Error: ' + response.content.decode('utf-8')

    return result

# Call the function to get the predicted labels
predicted_labels = (predict_labels())
output_json = json.dumps(predicted_labels)
print(output_json)
#pred = predicted_labels # Example string

# Remove square brackets and single quotes
#formatted_predictions = pred[2:-2]

#print(formatted_predictions)
