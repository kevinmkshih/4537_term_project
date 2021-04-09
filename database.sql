use inventory_tracker;

drop table if exists `items`;

create table `items`
(
    id          int auto_increment primary key,
    name        varchar(256) unique not null,
    quantity int,
    description varchar(2000) null
);


insert into `items` (name, quantity, description) values ('test name', 3, 'this is a test object');
insert into `items` (name, quantity, description) values ('test name', 4, 'this is a test object');
insert into `items` (name, quantity, description) values ('test name', 5, 'this is a test object');
insert into `items` (name, quantity, description) values ('test name', 6, 'this is a test object');


CREATE TABLE `api_access` (
    name varchar(256) not null,
    count int
);

insert into `api_access` values ("/allItems", 0);
insert into `api_access` values ("/itemsName", 0);
insert into `api_access` values ("/getApiCount", 0);
insert into `api_access` values ("/itemsid", 0);


create table api_access_record
(
    id int auto_increment,
    api_id int not null,
    access_count int default 0 not null,
    constraint api_access_record_pk primary key (id),
    constraint api_access_record_items_id_fk
        foreign key (api_id) references items (id)
            on update cascade on delete cascade
);

drop table if exist `users`;

create table users (
    id int auto_increment primary key,
    username varchar(256),
    password varchar(256)
);