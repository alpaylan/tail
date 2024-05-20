from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Response, status
from pymongo import MongoClient
import json
import requests

import pydantic
from bson import ObjectId
pydantic.json.ENCODERS_BY_TYPE[ObjectId]=str

mongo_conn_str = "mongodb://localhost:27017/"
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONN_STRING = "mongodb://localhost:27017/"

client = MongoClient(CONN_STRING)
db = client.get_database('cvdl')
resumes = db.get_collection('resumes')
resume_layouts = db.get_collection('resume_layouts')
section_layouts = db.get_collection('section_layouts')
data_schemas = db.get_collection('data_schemas')

import os
@app.post("/save_local_data")
def load_local_data():
    for resume in os.listdir('/Users/akeles/Programming/projects/cvdl/cvdl-ts/projdir/resumes'):
        name = resume.removesuffix('.json')
        data = json.load(open(f'/Users/akeles/Programming/projects/cvdl/cvdl-ts/projdir/resumes/{resume}'))
        resumes.insert_one({'name': name, 'data': data})

    resume_layouts_json = json.load(open('/Users/akeles/Programming/projects/cvdl/cvdl-ts/projdir/resume-layouts.json'))
    for resume_layout in resume_layouts_json:
        resume_layouts.insert_one(resume_layout)
    
    section_layouts_json = json.load(open('/Users/akeles/Programming/projects/cvdl/cvdl-ts/projdir/layout-schemas.json'))
    for section_layout in section_layouts_json:
        section_layouts.insert_one(section_layout)
    
    data_schemas_json = json.load(open('/Users/akeles/Programming/projects/cvdl/cvdl-ts/projdir/data-schemas.json'))
    for data_schema in data_schemas_json:
        data_schemas.insert_one(data_schema)



@app.get("/resumes")
def list_resumes():
    return [(lambda resume: resume['name'])(resume) for resume in resumes.find({})]

@app.get("/resume/{resume_name}")
def list_resumes(resume_name: str):
    print(resume_name)
    return resumes.find_one({'name': resume_name})

@app.get("/data_schemas")
def list_data_schemas():
    return [(lambda data_schema: data_schema['schema_name'])(data_schema) for data_schema in data_schemas.find({})]

@app.get("/data_schema/{data_schema_name}")
def list_data_schema(data_schema_name: str):
    return data_schemas.find_one({'schema_name': data_schema_name})

@app.get("/resume_layouts")
def list_resume_layouts():
    return [(lambda resume_layout: resume_layout['schema_name'])(resume_layout) for resume_layout in resume_layouts.find({})]

@app.get("/resume_layout/{resume_layout_name}")
def list_resume_layout(resume_layout_name: str):
    return resume_layouts.find_one({'schema_name': resume_layout_name})

@app.get("/layout_schemas")
def list_section_layouts():
    return [(lambda section_layout: section_layout['schema_name'])(section_layout) for section_layout in section_layouts.find({})]

@app.get("/layout_schema/{section_layout_name}")
def list_section_layout(section_layout_name: str):
    return section_layouts.find_one({'schema_name': section_layout_name})

@app.post("/font")
def add_font(font: dict):
    name : str = font['name']
    style : str = font['style']
    weight : str = font['weight']

    source: str = font['source']

    print(name, style, weight, source)

    def full_name(font):
        return font['name'] + "-" + font['weight'] + ("Italic" if font['style'] == "Italic" else "")
    match source:
        case 'Local':
            with open(f"assets/{name}/static/{full_name(font)}.ttf", "rb") as f:
                print(f"assets/{name}/static/{full_name(font)}.ttf")
                return Response(content=f.read(), media_type="application/x-font-ttf")
        case 'Remote':
            response = requests.get(f"https://gwfh.mranftl.com/api/fonts/{name.lower()}?subsets=latin")
            if response.ok:
                data = response.json()
                for variant in data['variants']:             
                    if variant['fontStyle'] == style.lower() and variant['fontWeight'] == weight.lower(): 
                        response = requests.get(variant['ttf'])
                        if response.ok:
                            return Response(content=response.content, media_type="application/binary")
            return None

        case _:
            return None
    

