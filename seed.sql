CREATE TABLE ARTICLES (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30),
  year VARCHAR(30)
);

INSERT INTO ARTICLES (id, name, year)
VALUES ('1', 'name', '2020'), 
 ('2', 'name2', '2020'), 
 ('3', 'name3', '2020');
