BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.users (
  id text PRIMARY KEY,
  name text,
  address text
);

CREATE TABLE public.restaurants (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text
);

CREATE TABLE public.menu_items (
  restaurant_id text,
  item_id serial,
  name text NOT NULL,
  PRIMARY KEY(restaurant_id, item_id)
);

ALTER TABLE ONLY public.menu_items
  ADD CONSTRAINT menu_items_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);


CREATE TABLE public.orders (
  order_id text PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  restaurant_id text NOT NULL,
  payment_rcvd boolean DEFAULT false,
  driver_assigned boolean DEFAULT false NOT NULL,
  food_picked boolean DEFAULT false NOT NULL,
  delivered boolean DEFAULT false NOT NULL,
  cancelled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.orders
  ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.orders
  ADD CONSTRAINT orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);

CREATE TABLE public.items (
  order_id text NOT NULL,
  item_id serial NOT NULL,
  quantity int NOT NULL
);

ALTER TABLE ONLY public.items
  ADD CONSTRAINT items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);

CREATE TABLE public.assignment (
  order_id text NOT NULL,
  driver_id integer NOT NULL
);

ALTER TABLE ONLY public.assignment
  ADD CONSTRAINT assignment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);

CREATE TABLE public.payments (
  id serial PRIMARY KEY,
  order_id text NOT NULL,
  type text,
  amount integer NOT NULL
);

ALTER TABLE ONLY public.payments
  ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);

CREATE VIEW public.number_order_driver_assigned AS
  SELECT count(*) AS count
    FROM public.orders
   WHERE (orders.driver_assigned = true);

CREATE VIEW public.number_orders AS
  SELECT count(*) AS count
    FROM public.orders;

INSERT INTO restaurants (id, name, address) values 
('r1', 'anjappar', '4th block koramangala'), 
('r2', 'hanoi', '100ft road koramangala'), 
('r3', 'bowl company', 'hsr layout'), 
('r4', 'homely', 'indiranagar'), 
('r5', 'pizza bakery', 'indiranagar');

INSERT INTO menu_items (restaurant_id, item_id, name) values
('r1',1, 'veg biryani'), ('r1', 2, 'egg biryani'), ('r1', 3, 'chicken biryani'),
('r2', 1, 'pho'), ('r2', 2, 'dimsums'), ('r2', 3, 'panacotta'),
('r3', 1, 'radjma bowl'), ('r3', 2, 'mushroom pasta'), ('r3', 3, 'paneer bowl'),
('r4', 1, 'bhindi meal'), ('r4', 2, 'aloo meal'), ('r4', 3, 'paneer meal'),
('r5', 1, 'pizza'), ('r5', 2, 'burger'), ('r5', 3, 'chocolate milkshake');

COMMIT;
