from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
import json

import redis
import pickle
r = redis.Redis(host='http://95.217.239.6', port=6379, db=0)
app = Flask(__name__)

CORS(app)


@app.route('/api/session',methods=['POST'])
def SessionData():
    if(request.method == 'POST'):
        try:
            data = request.get_json(force=True)
            session_id = data['session_id']
            
            res = r.get('session:'+session_id)    # replace with cookie
            result = pickle.loads(res)
            print( result )
            return jsonify({ "msg": 'success','data': json.load( result ) })
        except Exception as e:
            print(e)
            return jsonify( {'msg':'error', 'data': {}} )


if __name__ == '__main__':
    app.run('0.0.0.0',debug=False, port=7051,threaded=False,processes=1)
