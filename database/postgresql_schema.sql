--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-21 14:43:21

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16399)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 245 (class 1255 OID 16410)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16411)
-- Name: product_custodies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_custodies (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    stock integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_custodies OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16415)
-- Name: product_custodies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_custodies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_custodies_id_seq OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 217
-- Name: product_custodies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_custodies_id_seq OWNED BY public.product_custodies.id;


--
-- TOC entry 218 (class 1259 OID 16416)
-- Name: product_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_history (
    id integer NOT NULL,
    product_id integer NOT NULL,
    actor_id integer NOT NULL,
    action character varying(100) NOT NULL,
    location character varying(255),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    blockchain_hash character varying(66)
);


ALTER TABLE public.product_history OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16422)
-- Name: product_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_history_id_seq OWNER TO postgres;

--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 219
-- Name: product_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_history_id_seq OWNED BY public.product_history.id;


--
-- TOC entry 220 (class 1259 OID 16423)
-- Name: product_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_transfers (
    id integer NOT NULL,
    product_id integer NOT NULL,
    from_user_id integer NOT NULL,
    to_user_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    blockchain_hash character varying(66),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_transfers_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('completed'::character varying)::text, ('rejected'::character varying)::text])))
);


ALTER TABLE public.product_transfers OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16432)
-- Name: product_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_transfers_id_seq OWNER TO postgres;

--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 221
-- Name: product_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_transfers_id_seq OWNED BY public.product_transfers.id;


--
-- TOC entry 222 (class 1259 OID 16433)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100),
    producer_id integer NOT NULL,
    origin character varying(255),
    production_date date,
    blockchain_hash character varying(66),
    metadata_hash character varying(66),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16441)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 224 (class 1259 OID 16442)
-- Name: sale_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_transactions (
    id integer NOT NULL,
    product_id integer NOT NULL,
    seller_id integer NOT NULL,
    buyer_id integer NOT NULL,
    quantity numeric(10,2) NOT NULL,
    price_per_unit numeric(15,2) NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    location character varying(255),
    notes text,
    blockchain_hash character varying(66),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sale_transactions_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('in_transit'::character varying)::text, ('delivered'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE public.sale_transactions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16452)
-- Name: sale_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 225
-- Name: sale_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_transactions_id_seq OWNED BY public.sale_transactions.id;


--
-- TOC entry 226 (class 1259 OID 16453)
-- Name: shipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipments (
    id integer NOT NULL,
    product_id integer NOT NULL,
    distributor_id integer NOT NULL,
    origin character varying(255) NOT NULL,
    destination character varying(255) NOT NULL,
    transport_company character varying(255),
    quantity numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'in_transit'::character varying,
    notes text,
    blockchain_hash character varying(66),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shipments_status_check CHECK (((status)::text = ANY (ARRAY[('in_transit'::character varying)::text, ('delivered'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE public.shipments OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16462)
-- Name: shipments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipments_id_seq OWNER TO postgres;

--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 227
-- Name: shipments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipments_id_seq OWNED BY public.shipments.id;


--
-- TOC entry 228 (class 1259 OID 16463)
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    id integer NOT NULL,
    config_key character varying(100) NOT NULL,
    config_value text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16471)
-- Name: system_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_config_id_seq OWNER TO postgres;

--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 229
-- Name: system_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_config_id_seq OWNED BY public.system_config.id;


--
-- TOC entry 230 (class 1259 OID 16472)
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_type character varying(50),
    entity_id integer,
    ip_address inet,
    user_agent text,
    details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16478)
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 231
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- TOC entry 232 (class 1259 OID 16479)
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id character varying(128) NOT NULL,
    user_id integer NOT NULL,
    ip_address inet,
    user_agent text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16485)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    wallet_address character varying(42),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('producer'::character varying)::text, ('seller'::character varying)::text, ('distributor'::character varying)::text, ('user'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16494)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 234
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4791 (class 2604 OID 16495)
-- Name: product_custodies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies ALTER COLUMN id SET DEFAULT nextval('public.product_custodies_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16496)
-- Name: product_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history ALTER COLUMN id SET DEFAULT nextval('public.product_history_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 16497)
-- Name: product_transfers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers ALTER COLUMN id SET DEFAULT nextval('public.product_transfers_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 16498)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4803 (class 2604 OID 16499)
-- Name: sale_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions ALTER COLUMN id SET DEFAULT nextval('public.sale_transactions_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 16500)
-- Name: shipments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments ALTER COLUMN id SET DEFAULT nextval('public.shipments_id_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 16501)
-- Name: system_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config ALTER COLUMN id SET DEFAULT nextval('public.system_config_id_seq'::regclass);


--
-- TOC entry 4816 (class 2604 OID 16502)
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- TOC entry 4819 (class 2604 OID 16503)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 217
-- Name: product_custodies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_custodies_id_seq', 29, true);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 219
-- Name: product_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_history_id_seq', 101, true);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 221
-- Name: product_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_transfers_id_seq', 8, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 13, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 225
-- Name: sale_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_transactions_id_seq', 21, true);


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 227
-- Name: shipments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shipments_id_seq', 23, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 229
-- Name: system_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_config_id_seq', 11, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 231
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 223, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 234
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 32, true);


--
-- TOC entry 4828 (class 2606 OID 16505)
-- Name: product_custodies product_custodies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_pkey PRIMARY KEY (id);


--
-- TOC entry 4830 (class 2606 OID 16507)
-- Name: product_custodies product_custodies_product_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_product_id_user_id_key UNIQUE (product_id, user_id);


--
-- TOC entry 4837 (class 2606 OID 16509)
-- Name: product_history product_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history
    ADD CONSTRAINT product_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 16511)
-- Name: product_transfers product_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_pkey PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 16513)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4860 (class 2606 OID 16515)
-- Name: sale_transactions sale_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 16517)
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 16519)
-- Name: system_config system_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_config_key_key UNIQUE (config_key);


--
-- TOC entry 4873 (class 2606 OID 16521)
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- TOC entry 4880 (class 2606 OID 16523)
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 16525)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4890 (class 2606 OID 16527)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4892 (class 2606 OID 16529)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4894 (class 2606 OID 16531)
-- Name: users users_wallet_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_wallet_address_key UNIQUE (wallet_address);


--
-- TOC entry 4831 (class 1259 OID 16532)
-- Name: idx_product_history_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_action ON public.product_history USING btree (action);


--
-- TOC entry 4832 (class 1259 OID 16533)
-- Name: idx_product_history_actor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_actor_id ON public.product_history USING btree (actor_id);


--
-- TOC entry 4833 (class 1259 OID 16534)
-- Name: idx_product_history_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_blockchain_hash ON public.product_history USING btree (blockchain_hash);


--
-- TOC entry 4834 (class 1259 OID 16535)
-- Name: idx_product_history_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_product_id ON public.product_history USING btree (product_id);


--
-- TOC entry 4835 (class 1259 OID 16536)
-- Name: idx_product_history_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_timestamp ON public.product_history USING btree ("timestamp");


--
-- TOC entry 4838 (class 1259 OID 16537)
-- Name: idx_product_transfers_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_blockchain_hash ON public.product_transfers USING btree (blockchain_hash);


--
-- TOC entry 4839 (class 1259 OID 16538)
-- Name: idx_product_transfers_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_created_at ON public.product_transfers USING btree (created_at);


--
-- TOC entry 4840 (class 1259 OID 16539)
-- Name: idx_product_transfers_from_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_from_user_id ON public.product_transfers USING btree (from_user_id);


--
-- TOC entry 4841 (class 1259 OID 16540)
-- Name: idx_product_transfers_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_product_id ON public.product_transfers USING btree (product_id);


--
-- TOC entry 4842 (class 1259 OID 16541)
-- Name: idx_product_transfers_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_status ON public.product_transfers USING btree (status);


--
-- TOC entry 4843 (class 1259 OID 16542)
-- Name: idx_product_transfers_to_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_to_user_id ON public.product_transfers USING btree (to_user_id);


--
-- TOC entry 4846 (class 1259 OID 16543)
-- Name: idx_products_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_blockchain_hash ON public.products USING btree (blockchain_hash);


--
-- TOC entry 4847 (class 1259 OID 16544)
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- TOC entry 4848 (class 1259 OID 16545)
-- Name: idx_products_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_is_active ON public.products USING btree (is_active);


--
-- TOC entry 4849 (class 1259 OID 16546)
-- Name: idx_products_producer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_producer_id ON public.products USING btree (producer_id);


--
-- TOC entry 4850 (class 1259 OID 16547)
-- Name: idx_products_production_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_production_date ON public.products USING btree (production_date);


--
-- TOC entry 4853 (class 1259 OID 16548)
-- Name: idx_sale_transactions_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_blockchain_hash ON public.sale_transactions USING btree (blockchain_hash);


--
-- TOC entry 4854 (class 1259 OID 16549)
-- Name: idx_sale_transactions_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_buyer_id ON public.sale_transactions USING btree (buyer_id);


--
-- TOC entry 4855 (class 1259 OID 16550)
-- Name: idx_sale_transactions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_created_at ON public.sale_transactions USING btree (created_at);


--
-- TOC entry 4856 (class 1259 OID 16551)
-- Name: idx_sale_transactions_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_product_id ON public.sale_transactions USING btree (product_id);


--
-- TOC entry 4857 (class 1259 OID 16552)
-- Name: idx_sale_transactions_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_seller_id ON public.sale_transactions USING btree (seller_id);


--
-- TOC entry 4858 (class 1259 OID 16553)
-- Name: idx_sale_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_status ON public.sale_transactions USING btree (status);


--
-- TOC entry 4861 (class 1259 OID 16554)
-- Name: idx_shipments_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_blockchain_hash ON public.shipments USING btree (blockchain_hash);


--
-- TOC entry 4862 (class 1259 OID 16555)
-- Name: idx_shipments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_created_at ON public.shipments USING btree (created_at);


--
-- TOC entry 4863 (class 1259 OID 16556)
-- Name: idx_shipments_distributor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_distributor_id ON public.shipments USING btree (distributor_id);


--
-- TOC entry 4864 (class 1259 OID 16557)
-- Name: idx_shipments_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_product_id ON public.shipments USING btree (product_id);


--
-- TOC entry 4865 (class 1259 OID 16558)
-- Name: idx_shipments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_status ON public.shipments USING btree (status);


--
-- TOC entry 4868 (class 1259 OID 16559)
-- Name: idx_system_config_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_config_is_active ON public.system_config USING btree (is_active);


--
-- TOC entry 4869 (class 1259 OID 16560)
-- Name: idx_system_config_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_config_key ON public.system_config USING btree (config_key);


--
-- TOC entry 4874 (class 1259 OID 16561)
-- Name: idx_system_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_action ON public.system_logs USING btree (action);


--
-- TOC entry 4875 (class 1259 OID 16562)
-- Name: idx_system_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_created_at ON public.system_logs USING btree (created_at);


--
-- TOC entry 4876 (class 1259 OID 16563)
-- Name: idx_system_logs_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_entity_id ON public.system_logs USING btree (entity_id);


--
-- TOC entry 4877 (class 1259 OID 16564)
-- Name: idx_system_logs_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_entity_type ON public.system_logs USING btree (entity_type);


--
-- TOC entry 4878 (class 1259 OID 16565)
-- Name: idx_system_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_user_id ON public.system_logs USING btree (user_id);


--
-- TOC entry 4881 (class 1259 OID 16566)
-- Name: idx_user_sessions_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions USING btree (expires_at);


--
-- TOC entry 4882 (class 1259 OID 16567)
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- TOC entry 4885 (class 1259 OID 16568)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4886 (class 1259 OID 16569)
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- TOC entry 4887 (class 1259 OID 16570)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4888 (class 1259 OID 16571)
-- Name: idx_users_wallet_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_wallet_address ON public.users USING btree (wallet_address);


--
-- TOC entry 4910 (class 2620 OID 16572)
-- Name: product_transfers update_product_transfers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_product_transfers_updated_at BEFORE UPDATE ON public.product_transfers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4911 (class 2620 OID 16573)
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4912 (class 2620 OID 16574)
-- Name: sale_transactions update_sale_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sale_transactions_updated_at BEFORE UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4913 (class 2620 OID 16575)
-- Name: shipments update_shipments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4914 (class 2620 OID 16576)
-- Name: system_config update_system_config_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4915 (class 2620 OID 16577)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4895 (class 2606 OID 16578)
-- Name: product_custodies product_custodies_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4896 (class 2606 OID 16583)
-- Name: product_custodies product_custodies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4897 (class 2606 OID 16588)
-- Name: product_history product_history_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history
    ADD CONSTRAINT product_history_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4898 (class 2606 OID 16593)
-- Name: product_history product_history_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history
    ADD CONSTRAINT product_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4899 (class 2606 OID 16598)
-- Name: product_transfers product_transfers_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4900 (class 2606 OID 16603)
-- Name: product_transfers product_transfers_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4901 (class 2606 OID 16608)
-- Name: product_transfers product_transfers_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4902 (class 2606 OID 16613)
-- Name: products products_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4903 (class 2606 OID 16618)
-- Name: sale_transactions sale_transactions_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 16623)
-- Name: sale_transactions sale_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4905 (class 2606 OID 16628)
-- Name: sale_transactions sale_transactions_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4906 (class 2606 OID 16633)
-- Name: shipments shipments_distributor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4907 (class 2606 OID 16638)
-- Name: shipments shipments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4908 (class 2606 OID 16643)
-- Name: system_logs system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4909 (class 2606 OID 16648)
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-07-21 14:43:22

--
-- PostgreSQL database dump complete
--

