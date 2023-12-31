-- CREATE TABLE ARTICLES (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(30),
--   year VARCHAR(30)
-- );

-- INSERT INTO ARTICLES (id, name, year)
-- VALUES ('1', 'name', '2020'), 
--  ('2', 'name2', '2020'), 
--  ('3', 'name3', '2020');


CREATE TABLE INSTITUTIONS (
  id VARCHAR(200) PRIMARY KEY NOT NULL,
  name VARCHAR(200),
  country VARCHAR(200),
  address VARCHAR(200),
  region VARCHAR(200)
);


CREATE TABLE SUBMISSIONS (
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

