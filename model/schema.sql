-- players table
CREATE TABLE players(p_id INTEGER NOT NULL AUTO_INCREMENT,
    p_name varchar(50),u_id integer NOT NULL REFERENCES users(id),
    t_id integer NOT NULL REFERENCES tournaments(t_id), PRIMARY KEY(p_id,p_name));

-- users table
CREATE TABLE users(id SERIAL PRIMARY KEY,
    email varchar(50), password varchar(200));

-- tournaments table
CREATE TABLE tournaments(t_id int AUTO_INCREMENT,t_name varchar(50),
    u_id INTEGER NOT NULL REFERENCES users(id),status varchar(20) NOT NULL,
    winner varchar(20) NOT NULL, primary key(t_id,t_name) );

-- matches table
CREATE TABLE matches(m_id SERIAL PRIMARY KEY,t_id int NOT NULL REFERENCES tournaments(t_id),
    round int NOT NULL,player_1 varchar(50) NOT NULL REFERENCES players(p_name),
    player_2 varchar(50) NOT NULL REFERENCES players(p_name),
    winner varchar(50) NOT NULL REFERENCES players(p_name),
    loser varchar(50) NOT NULL REFERENCES players(p_name));

