from random import randint, random
import resource
import csv
from flask import Flask, jsonify
from flask_cors import cross_origin

lock = 0
app = Flask(__name__)

@app.route("/", methods=['GET'])
@cross_origin()
def get_example():
    file = open("/var/www/NuclearWebpage/flask/sample.csv", "r")
    data = list(csv.reader(file, delimiter=","))
    file.close()

    response = {
        'power': 0, 
        'coreTemp': data[0][7], 
        'coolentTemp': -1
    }
    return jsonify(response)

@app.route("/test", methods=['GET'])
@cross_origin()
def get_test():
    return lock

if __name__ == '__main__':
    app.run()