import requests
import xml.etree.ElementTree as ET

url = (
    "https://api.irishrail.ie/realtime/realtime.asmx/"
    "getStationDataByNameXML?StationDesc=Dalkey"
)

response = requests.get(url)
root = ET.fromstring(response.content)

namespace = {"i": "http://api.irishrail.ie/realtime/"}

for train in root.findall("i:objStationData", namespace):

    train_type = train.find("i:Traintype", namespace).text
    direction = train.find("i:Direction", namespace).text

    if train_type == "DART" and direction == "Northbound":

        departure = train.find("i:Expdepart", namespace).text
        destination = train.find("i:Destination", namespace).text
        train_code = train.find("i:Traincode", namespace).text

        print(departure, destination, train_code)