from random import randint, random
import csv
from flask import Flask, jsonify, request, Response
from flask_cors import CORS, cross_origin
import numpy as np

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/", methods=['GET'])
@cross_origin()
def get():
     file = open("sample.csv", "r")
     data = list(csv.reader(file, delimiter=","))
     file.close()
     if data == []: return 400
     return jsonify(data)

@app.route("/control", methods=['GET'])
@cross_origin()
def getControlPower():
     file = open("steamDemand.txt", "r")
     data = file.read()
     file.close()
     return jsonify(data)

# Switch on VM for external access
if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000)