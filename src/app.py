import json
import os
import urllib.parse as urlparse

import gpxpy
import gpxpy.gpx
import requests
from flask import Flask, send_file

APIKEY = os.environ['DATA_GOUV_NC_APIKEY']

app = Flask(__name__)


@app.route('/')
def root():
  return send_file('html/index.html')


@app.route('/api/health/')
def health():
  return {'message': 'Healthy'}


@app.route('/api/randonnees', methods=['GET'])
def get_randonnees():
  uri = 'https://data.gouv.nc/api/records/1.0/search/?dataset=sentiers-de-randonnee-en-province-sud&fields=id,title,description&rows=10000'

  res = requests.get(uri, headers={'Authorization': f'Apikey {APIKEY}'})

  randonnees = list(map(lambda record: record['fields'], res.json()['records']))

  return app.response_class(
    response=json.dumps(randonnees),
    status=200,
    mimetype='application/json'
  )


@app.route('/api/randonnees/<id>', methods=['GET'])
def get_gpx(id):
  uri = f'https://data.gouv.nc/api/records/1.0/search/?dataset=sentiers-de-randonnee-en-province-sud&fields=id,title,description,tracewkt&rows=1&q=id%3D{id}'

  res = requests.get(uri, headers={'Authorization': f'Apikey {APIKEY}'})

  randonnee = res.json()['records'][0]['fields']

  gpx = gpxpy.gpx.GPX()

  gpx_track = gpxpy.gpx.GPXTrack()
  gpx.tracks.append(gpx_track)

  gpx_segment = gpxpy.gpx.GPXTrackSegment()
  gpx_track.segments.append(gpx_segment)

  for point in randonnee['tracewkt']['coordinates']:
    longitude, latitude = point
    gpx_segment.points.append(gpxpy.gpx.GPXTrackPoint(latitude, longitude))

  return app.response_class(
    response=json.dumps({
      'id': randonnee['id'],
      'title': randonnee['title'],
      'description': randonnee['description'],
      'gpx': gpx.to_xml()
    }),
    status=200,
    mimetype='application/json'
  )
