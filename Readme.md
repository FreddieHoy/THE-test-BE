# Freds Notes - test round 2

I've decided to have another go doing what I want to really learn about which is setting up the BE importing json file into a postgres DB and serving it as a api. (In the end I just added 1 end point to add more JSON to the submissions table)

So aim: 

> Setup storage mechanism to store the data and allow for adding new data (rather than using static JSON files)

## Importing the Json into a postgres DB.

##### - Step 1 run any SQL script from vs code in the docker postgres data base.. (hOw dO i dO tHaT ?)

Took a while to figure that one out but I've done it.

NOTE: I think because I'm using docker there's an added layer of complexity getting roles etc..

> docker run --name THE-test-db -d -p 5432:5432 -e POSTGRES_PASSWORD=****** -e POSTGRES_USER=freddie -d postgres

> docker exec -it THE-test-db psql -U freddie

> docker cp ./seed.sql THE-test-db:/docker-entrypoint-initdb.d/dump.sql

> docker exec THE-test-db psql postgres -U freddie  -f /docker-entrypoint-initdb.d/dump.sql

THIS WORKS!
> docker exec -it THE-test-db psql -U freddie -d postgres -a -f /docker-entrypoint-initdb.d/dump.sql

TOGETHER 
> docker cp ./seed.sql THE-test-db:/docker-entrypoint-initdb.d/dump.sql
> docker exec -it THE-test-db psql -U freddie -d postgres -a -f /docker-entrypoint-initdb.d/dump.sql


(Challenge) - What would a BE dev actually do about the subject? Seems like it should have it's own table. Although the only columns would be id and name I think? Maybe History..
I've decided it shouldn't so going to press ahead with the task.
**More on this below**

##### - Step 2. Create a script that:
  1. Creates the table (sort of optional now because I can do that before hand)
  2. pulls in json and inserts them into the table.

Using this - https://konbert.com/blog/import-json-into-postgres-using-copy 

Apparently the Json file needs to be a NDJSON file.

> jq -c '.[]' institutions.json > institutionsND.json

connect to db using

> docker exec -it THE-test-db psql -U freddie

Temp table

> CREATE TABLE temp (data jsonb);

Here's where it get a little tricky I need to copy on the json file into docker and then use the copy command.

> docker cp ./institutionsND.json THE-test-db:/docker-entrypoint-initdb.d/institutionsND.json

then back into docker

> docker exec -it THE-test-db psql -U freddie
Then inside docker psql command line
> \COPY temp (data) FROM '/docker-entrypoint-initdb.d/institutionsND.json';

try and query the data 

> SELECT data->>'id', data->>'name', data->>'country', data->>'address' FROM temp;

ohh so far so good babyy!

Okay so this is sort of where the script would come in but I might just do it manually

CREATE TABLE INSTITUTIONS (
  id PRIMARY KEY NOT NULL,
  name VARCHAR(200),
  country VARCHAR(200),
  address VARCHAR(200),
  region VARCHAR(200)
);

INSERT INTO INSTITUTIONS
SELECT data->>'id', data->>'name', data->>'country', data->>'address', data->>'region'
FROM temp;

SELECT * FROM INSTITUTIONS;

So, It's there in my data base! I was connected to the database on table plus as the user 'postgres' not 'freddie' which is why I could only see it in the cmd line

Okay going to try and import submissions now. Leaving the commands I used below.

> jq -c '.[]' submissions.json > submissionsND.json

> docker cp ./submissionsND.json THE-test-db:/docker-entrypoint-initdb.d/submissionsND.json

> \COPY temp2 FROM '/docker-entrypoint-initdb.d/submissionsND.json';

> CREATE TABLE SUBMISSIONS (
  id VARCHAR(200),
  institution_id VARCHAR(200),
  year INTEGER,
  students_total INTEGER,
  undergraduates_total INTEGER,
  postgraduates_total INTEGER,
  staff_total INTEGER,
  academic_papers INTEGER,
  institution_income INTEGER,
  subjects JSON
);


> INSERT INTO SUBMISSIONS
> SELECT data->>'id', data->>'institution_id', (data->>'year')::integer, (data->>'students_total')::integer, (data->>'undergraduates_total')::integer, (data->>'postgraduates_total')::integer, (data->>'staff_total')::integer, (data->>'academic_papers')::integer, (data->>'institution_income')::integer, (data->>'subjects')::JSON
FROM temp2;

**There we go I now have all the data in a postgres database!!**

---

## Going to create an api endpoint  to interact with the DB.

It's going to be node.js express.js.

Data for submissions could be sent from a client like where it has come from as JSON.

So I want to just built an endpoint that takes JSON add tries to add that to the database.

I can actually try to parse the JSON object with TS and then add it to the DB. So it would be a different process they just reading from a JSON file. So if another json file was found this end point would handle adding the results to the DB.

Okay I've created a endpoint POST /submissionsJSON

I've written how I would handle parsing the JSON data and how I would use a type guard to ensure the data is safe..

**What I'm really interested in** is the issue around the **subjects** attribute. 

The subject fields can't be made into there own table because the entities values change on every submission. 

It would create the exact same number of entities on Submissions table as the Subjects table... Maybe that's good? 

It would mean giving EVERY subject option an id. And then the subjects prop would be an array of foreign keys?! Maybe that would work nicely??


# Conclusion

I'm going to end this here. Definetly learned quite a bit about using postgres, docker containers and interacting JSON with DBs.

I want to learn more about storing this 'subjects' data case. Will ask around! 

---

# Times Higher Education take home test

At Time Higher Education our aim is give the best insights we can into higher education for both students and academics. In this test, we'd like to give you a taste of that and give you the opportunity to show us how you could improve this

In this repository we've given you some autogenerated dummy data about some higher education institutions and example submission data. What we would like you to do is take this data and do something interesting with it; there are some suggestions below to inspire you but feel free to use your imagination.

The aim is to have something to show us what interests you technically, and have something concrete to talk about in the later technical interview. There are no hard and fast rules but there some guidelines as to what we're expecting:

 - Ideally spend between 1 to 2 hours on the problem; you can spend a little more if you want but we don't want this to be a chore or an exercise of how much you can achieve in a time limit. We'd rather have one solid interesting technical point to talk about than a very wide but shallow app.
 - Based on the time constraints, it's better to think small and complete and have ideas of what/how you'd do something bigger. Part of the technical interview will be looking at the limitations of what you did and talking through what you'd do if had more time.
 - We would like to see some code/scripts of what you've done; ideally we'd prefer it in JS/Typescript but any reasonably modern language is fine.
 - Likewise we're not expecting something production ready, but it should reflect how you approach the problem normally rather than something you'd throw away afterwards.

# Files

There are two files, `institutions.json` and `submissions.json`; an institution is a university or other higher education body, and a submission is some data they told us about themselves for a particular year. There is a foreign key from submission to institution and broadly speaking the fields are fairly self explanatory. N.B. this data is auto generated so there may not be obvious trends and numbers may not add up to produce totals you'd expect.

# Suggestions
Here are a list of some examples of things you could do with the data; feel free to use one of these but also feel free to try something else if you feel inspired.

Look at the data and see how it could be enhanced or what insights could be gained from it:
 - Produce a list of the best institutions to study a particular subject
 - Enhance the data by adding some new data e.g. adding how many [Covid-19 cases](https://github.com/nytimes/covid-19-data) there have been per country/institution (N.B. as our dataset names are made up, feel free to amend them to show it working)

Show us how you could setup a service to manage this sort of data:
 - Create an API that would be able to serve the data to a frontend to render
 - Setup storage mechanism to store the data and allow for adding new data (rather than using static JSON files)

Display and interact the data:
 - Display some submission data per institution for each year in either a table or chart
 - Show a list of subjects and which institutions you can study them at


