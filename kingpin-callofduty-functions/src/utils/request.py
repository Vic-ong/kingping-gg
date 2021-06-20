from flask import abort

def use_method(request, method):
    if request.method != method:
        return abort(405, 'Method Not Allowed!')
    return {
        'Access-Control-Allow-Origin': '*'
    }

def cors(method):
    # Set CORS headers for the preflight request
    # header and caches preflight response for an 3600s
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': method,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }
    return ('', 204, headers)
