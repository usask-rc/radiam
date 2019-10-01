# Pull base image
FROM python:3.7.3

# Set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Install dependencies
RUN pip install --upgrade pip

# Copy requirements.txt file and install
COPY ./radiam/requirements.txt /code/radiam/requirements.txt
RUN pip install -r /code/radiam/requirements.txt

# Copy version file into container.

COPY ./VERSION /etc/VERSION
# Copy project files
COPY . /code/

# Install waitoforit script for blocking until postgres
RUN git clone https://github.com/usask-rc/wait-for-it.git /wait-for-it

# collect static files
RUN python manage.py collectstatic --no-input --clear
