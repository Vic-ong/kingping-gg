from flask import Flask, request
import main as fn


app = Flask(__name__)

@app.route('/send_slack_message', methods = ['POST'])
def send_slack_message():
    return fn.send_slack_message(request)

@app.route('/validate_users', methods = ['POST'])
def validate_users():
    return fn.validate_users(request)

@app.route('/betting_odds', methods = ['POST'])
def betting_odds():
    return fn.betting_odds(request)

@app.route('/find_matches', methods = ['POST'])
def find_matches():
    return fn.find_matches(request)

@app.route('/find_match_outcome', methods = ['GET'])
def find_match_outcome():
    res = fn.find_match_outcome({}, {})
    return (
        { 'res': 'completed' },
        200,
        { 'Access-Control-Allow-Origin': '*' },
    )

@app.route('/find_match_outcome_test', methods = ['GET'])
def find_match_outcome_test():
    res = fn.find_match_outcome_test({}, {})
    return (
        { 'res': 'completed' },
        200,
        { 'Access-Control-Allow-Origin': '*' },
    )

@app.route('/run_backfill', methods = ['GET'])
def run_backfill():
    res = fn.run_backfill()
    return (
        { 'res': 'completed' },
        200,
        { 'Access-Control-Allow-Origin': '*' },
    )

if __name__ == "__main__":
  app.run()
