Database ``smarthome``

Create table userinfo

```sql
create table userinfo (id serial primary key, username varchar not null, password varchar(30), email varchar(30));
```

Create table house

```sql
create table house (id serial primary key, name varchar not null, userid integer);
```

Create table floor

```sql
create table floor (id serial primary key, name varchar not null, userid integer, housename varchar);
```

Create table room

```sql
create table room (id serial primary key, name varchar not null, userid integer, floorname varchar, housename varchar);
```

Create table devices

```sql
create table devices (id serial primary key, name varchar not null, type varchar, floorname varchar, housename varchar, userid integer, roomname varchar);
```
