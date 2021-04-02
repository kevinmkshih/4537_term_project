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
