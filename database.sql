use inventory_tracker;

drop table if exists `items`;

create table `items`
(
    id          int auto_increment primary key,
    name        varchar(256) unique not null,
    quantity int,
    description varchar(2000) null
);


insert into `items` (name, quantity, description) values ('test name1', 3, 'this is a test object');
insert into `items` (name, quantity, description) values ('test name2', 4, 'this is a test object');
insert into `items` (name, quantity, description) values ('test name3', 5, 'this is a test object');
insert into `items` (name, quantity, description) values ('test name4', 6, 'this is a test object');

drop table if exists api_access;
CREATE TABLE `api_access` (
    name varchar(256) not null,
    count int
);

insert into `api_access` values ("/allItems", 0);
insert into `api_access` values ("/itemsName", 0);
insert into `api_access` values ("/getApiCount", 0);
insert into `api_access` values ("/itemsid", 0);




drop table if exists `users`;

create table users (
    id int auto_increment primary key,
    username varchar(256),
    password varchar(256)
);