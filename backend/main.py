from fastapi import FastAPI

app = FastAPI(title='WooConsulting Backend')

@app.get('/')
def root():
    return {'ok': True, 'msg': 'WooConsulting backend'}
