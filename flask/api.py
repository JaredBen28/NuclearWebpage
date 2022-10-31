from random import randint, random
import resource
from flask import Flask, jsonify
from flask_cors import cross_origin

app = Flask(__name__)

@app.route("/", methods=['GET'])
@cross_origin()
def get_example():
    response = {
        'power': randint(0,100), 
        'coreTemp': randint(0,100), 
        'coolentTemp': randint(0,100)
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run()