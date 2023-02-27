from random import randint, random
import csv
from flask import Flask, jsonify, request, Response
from flask_cors import CORS, cross_origin
import numpy as np

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/", methods=['POST', 'GET'])
@cross_origin()
def get():
   if request.method == 'POST':
        content = request.json
        content = [content['control']]
        if content[0] == "": return jsonify({'response':'not valid'})
        np.array(content).tofile('control.txt', sep=",")
        return jsonify({'response':'Percentage Changed', 'Percentage': content})
   else:
        file = open("sample.csv", "r")
        data = list(csv.reader(file, delimiter=","))
        file.close()
        if data == []: return 400
        return jsonify(data)
if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000)