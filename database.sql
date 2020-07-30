create schema janggokComu;
create user janggokComu@localhost;

use janggokComu;
grant all privileges on janggokComu.* to janggokComu@localhost;

create table users
(
	id bigint not null,
	username tinytext not null,
	passwd tinytext not null,
	joinedAt timestamp default CURRENT_TIMESTAMP null
);

create unique index users_id_uindex
	on users (id);

alter table users
	add constraint users_pk
		primary key (id);

alter table users
	add admin boolean default false not null;

create table bd_noti
(
	id bigint not null,
	title tinytext default '(제목없음)' not null,
	content longtext null,
	createdAt timestamp default CURRENT_TIMESTAMP null,
	likes int default 0 not null,
	author bigint not null,
	constraint bd_noti_users_id_fk
		foreign key (author) references users (id)
);

create unique index bd_noti_id_uindex
	on bd_noti (id);

alter table bd_noti
	add constraint bd_noti_pk
		primary key (id);

create table bd_suggest
(
	id bigint not null,
	title tinytext default '(제목없음)' not null,
	content longtext null,
	createdAt timestamp default CURRENT_TIMESTAMP null,
	likes int default 0 not null,
	author bigint not null,
	constraint bd_suggest_users_id_fk
		foreign key (author) references users (id)
);

create unique index bd_suggest_id_uindex
	on bd_suggest (id);

alter table bd_suggest
	add constraint bd_suggest_pk
		primary key (id);

INSERT INTO users (id, username, passwd, joinedAt, admin) VALUES (0, '베타테스터', 'passwd', DEFAULT, DEFAULT);
INSERT INTO users (id, username, passwd, joinedAt, admin) VALUES (1, '박민혁', 'passwd', DEFAULT, 1);