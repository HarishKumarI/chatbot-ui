from flask import Flask, request, Response, jsonify, send_file, send_from_directory
from flask_cors import CORS
import json

import redis
import pickle
r = redis.Redis(host='localhost', port=6379, db=0)
app = Flask(__name__)

CORS(app)

@app.route('/api/session_list',methods=['GET'])
def SessionList():
    if(request.method == 'GET'):
        
        
        res = r.keys()   
        
        session_list = [x.decode('utf-8')[8:] for x in res if x.decode('utf-8').startswith('session:')]
                    

        return jsonify({'session_list': session_list})


@app.route('/api/session',methods=['POST'])
def SessionData():
    if(request.method == 'POST'):
        data = request.get_json(force=True)
        session_id = data['session_id']
        res = r.get('session:'+session_id)    # replace with cookie
        result = pickle.loads(res)
#         result = dict( result )
#         result = result['history']

        for res in result['history']:
            if res['inference_output'] != None:
                for i, el in enumerate(res['inference_output']):
                    res['inference_output'][i]['G'] = None

        print( result['history'] )
                    

        return jsonify(result['history'])
#         except Exception as e:
#             print(e)
#             return jsonify( {'msg':'error', 'data': {} } )


if __name__ == '__main__':
    app.run('0.0.0.0',debug=True, port=7051,threaded=False,processes=1)
