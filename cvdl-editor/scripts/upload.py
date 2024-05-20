
# Upload local files to S3

import os
import sys
import boto3

session = boto3.Session(profile_name='default')
s3 = session.resource('s3')


s3_bucket = 'cvdl-editor'

def upload_file(file_name, bucket, object_name=None):
    print("Uploading " + file_name + " to " + bucket)
    if object_name is None:
        object_name = file_name

    try:
        s3.meta.client.upload_file(file_name, bucket, object_name, ExtraArgs={'ACL': 'public-read'})
    except Exception as e:
        print(e)
        return False

    return True

def upload_dir(dir_name, bucket, prefix=None):
    print("Uploading " + dir_name + " to " + bucket)
    print(os.listdir(dir_name))
    for root, dirs, files in os.walk(dir_name):
        for file in files:
            file_path = os.path.join(root, file)
            object_name = file_path.replace(dir_name, '')
            if prefix:
                object_name = prefix + object_name
            upload_file(file_path, bucket, object_name)


if __name__ == '__main__':
    upload_dir("../data", s3_bucket, "data")
    