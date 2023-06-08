import os
import json
import shutil
import requests
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from PIL import Image

def preprocess(image, mean=0.5, std=0.5, shape=(299, 299)):
    """Scale, normalize and resizes images."""
    image = image / 255.0  # Scale
    image = (image - mean) / std  # Normalize
    image = tf.image.resize(image, shape)  # Resize
    return image

my_file = open("/var/www/Heiwan/label.txt", "r")
  
data = my_file.read()
  
data_into_list = data.split("\n")
print(data_into_list)
my_file.close()

labels = data_into_list
tf_labels = tf.constant(labels, dtype=tf.string)


def postprocess(prediction, labels=tf_labels):
    """Convert from probs to labels."""
    indices = tf.argmax(prediction, axis=-1)  # Index with highest prediction
    label = tf.gather(params=labels, indices=indices)  # Class name
    return label

sample_img = mpimg.imread('/var/www/Heiwan/downloads/downloaded.jpg')
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
ppoutput = postprocess(rest_outputs)
output_json = json.dumps(ppoutput.numpy().tolist())
print(output_json)
