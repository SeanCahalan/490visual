import sys
from flask import Flask, request, abort

app = Flask(__name__)

@app.route('/', methods=['POST'])
def webhook():
    print("webhook"); sys.stdout.flush()
    if request.method == 'POST':
        print(request.json)
        return '', 200
    else:
        abort(400)


if __name__ == '__main__':
    app.run(host="0.0.0.0")