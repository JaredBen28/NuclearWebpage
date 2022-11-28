from random import randint, random
import resource
import csv
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from threading import Thread

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/", methods=['POST', 'GET'])
@cross_origin()
def login():
   if request.method == 'POST':
       content = request.json
       return content
   else:
        file = open("sample.csv", "r")
        data = list(csv.reader(file, delimiter=","))
        file.close()
        resp = {
            'power': 0, 
            'coreTemp': data[0][7], 
            'coolentTemp': -1
        }
        return jsonify(resp)
        return "post"
if __name__ == '__main__':
    app.run(debug=True)