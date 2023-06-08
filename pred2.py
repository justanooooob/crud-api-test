import os
import json
import shutil
import requests
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from PIL import Image
import sys

url = sys.argv[1]

def preprocess(image, mean=0.5, std=0.5, shape=(299, 299)):
    """Scale, normalize and resizes images."""
    image = image / 255.0  # Scale
    image = (image - mean) / std  # Normalize
    image = tf.image.resize(image, shape)  # Resize
    return image

my_file = open("/var/www/Heiwan/label.txt", "r")
data = my_file.read()
data_into_list = data.split("\n")
labels = data_into_list
tf_labels = tf.constant(labels, dtype=tf.string)


def postprocess(prediction, labels=tf_labels):
    """Convert from probs to labels."""
    indices = tf.argmax(prediction, axis=-1)  # Index with highest prediction
    label = tf.gather(params=labels, indices=indices)  # Class name
    return label

def convert_to_jpg(input_file, output_file):
    try:
        # Open the input image file
        image = Image.open(input_file)

        # Convert the image to RGB mode if it's in RGBA mode
        if image.mode == "RGBA":
            image = image.convert("RGB")

        if image.mode == "P":
            image = image.convert("RGB")    

        # Save the image in JPG format
        image.save(output_file, "JPEG")
        

    except Exception as e:
        error = e

filepath = str(url)
filename, _ = os.path.splitext(os.path.basename(filepath))
output_filepath = '/var/www/Heiwan/predictions/'
output_filename = output_filepath + filename + '.jpg'

input_file = url
output_file = output_filename
convert_to_jpg(input_file, output_file)

sample_img = mpimg.imread(output_filename)
preprocess_img = preprocess(sample_img)
batched_img = tf.expand_dims(preprocess_img, axis=0)
batched_img = tf.cast(batched_img, tf.float32)

data = json.dumps(
    {"signature_name": "serving_default", "instances": batched_img.numpy().tolist()}
)
url = "http://heiwan-api.app:8501/v1/models/heiwan:predict"

def predict_rest(json_data, url):
    json_response = requests.post(url, data=json_data)
    response = json.loads(json_response.text)
    rest_outputs = np.array(response["predictions"])
    return rest_outputs

rest_outputs = predict_rest(data, url)

def make_prediction(instances):
   data = json.dumps({"signature_name": "serving_default", "instances": instances.numpy().tolist()})
   headers = {"content-type": "application/json"}
   json_response = requests.post(url, data=data, headers=headers)
   predictions = json.loads(json_response.text)['predictions']
   return predictions

url = "http://heiwan-api.app:8501/v1/models/heiwan:predict"
predictions = make_prediction(batched_img)
for pred in predictions:
    pred_int = np.argmax(pred)



file_path = output_filename

try:
    os.remove(output_filename)
except Exception as e:
    error = e


output_json = labels[pred_int]
outputjson = json.dumps(output_json)
print(outputjson)