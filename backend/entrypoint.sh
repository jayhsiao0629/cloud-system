#! /bin/bash

export FLASK_APP=flaskr
flask init-db
flask --app flaskr run --host=0.0.0.0 --port=5000 --debug
