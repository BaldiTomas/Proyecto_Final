--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

-- Started on 2025-07-24 12:47:14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 20234)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 245 (class 1255 OID 20486)
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
-- TOC entry 234 (class 1259 OID 20516)
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
-- TOC entry 233 (class 1259 OID 20515)
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
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 233
-- Name: product_custodies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_custodies_id_seq OWNED BY public.product_custodies.id;


--
-- TOC entry 221 (class 1259 OID 20314)
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
-- TOC entry 220 (class 1259 OID 20313)
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
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 220
-- Name: product_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_history_id_seq OWNED BY public.product_history.id;


--
-- TOC entry 227 (class 1259 OID 20402)
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
    CONSTRAINT product_transfers_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.product_transfers OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 20401)
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
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 226
-- Name: product_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_transfers_id_seq OWNED BY public.product_transfers.id;


--
-- TOC entry 219 (class 1259 OID 20267)
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    price numeric(12,2) DEFAULT 0.00
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 20266)
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
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 218
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 223 (class 1259 OID 20339)
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
    CONSTRAINT sale_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'in_transit'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.sale_transactions OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 20338)
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
-- TOC entry 4988 (class 0 OID 0)
-- Dependencies: 222
-- Name: sale_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_transactions_id_seq OWNED BY public.sale_transactions.id;


--
-- TOC entry 225 (class 1259 OID 20374)
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
    CONSTRAINT shipments_status_check CHECK (((status)::text = ANY ((ARRAY['in_transit'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.shipments OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 20373)
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
-- TOC entry 4989 (class 0 OID 0)
-- Dependencies: 224
-- Name: shipments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shipments_id_seq OWNED BY public.shipments.id;


--
-- TOC entry 229 (class 1259 OID 20436)
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
-- TOC entry 228 (class 1259 OID 20435)
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
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 228
-- Name: system_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_config_id_seq OWNED BY public.system_config.id;


--
-- TOC entry 231 (class 1259 OID 20452)
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
    created_at timestamp with time zone DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires'::text)
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 20451)
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
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 230
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- TOC entry 232 (class 1259 OID 20471)
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
-- TOC entry 217 (class 1259 OID 20246)
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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'producer'::character varying, 'seller'::character varying, 'distributor'::character varying, 'user'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 20245)
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
-- TOC entry 4992 (class 0 OID 0)
-- Dependencies: 216
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4721 (class 2604 OID 20519)
-- Name: product_custodies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies ALTER COLUMN id SET DEFAULT nextval('public.product_custodies_id_seq'::regclass);


--
-- TOC entry 4699 (class 2604 OID 20317)
-- Name: product_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history ALTER COLUMN id SET DEFAULT nextval('public.product_history_id_seq'::regclass);


--
-- TOC entry 4710 (class 2604 OID 20405)
-- Name: product_transfers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers ALTER COLUMN id SET DEFAULT nextval('public.product_transfers_id_seq'::regclass);


--
-- TOC entry 4694 (class 2604 OID 20270)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4701 (class 2604 OID 20342)
-- Name: sale_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions ALTER COLUMN id SET DEFAULT nextval('public.sale_transactions_id_seq'::regclass);


--
-- TOC entry 4706 (class 2604 OID 20377)
-- Name: shipments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments ALTER COLUMN id SET DEFAULT nextval('public.shipments_id_seq'::regclass);


--
-- TOC entry 4714 (class 2604 OID 20439)
-- Name: system_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config ALTER COLUMN id SET DEFAULT nextval('public.system_config_id_seq'::regclass);


--
-- TOC entry 4718 (class 2604 OID 20455)
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- TOC entry 4690 (class 2604 OID 20249)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4977 (class 0 OID 20516)
-- Dependencies: 234
-- Data for Name: product_custodies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_custodies (id, product_id, user_id, stock) FROM stdin;
3	3	23	12
2	2	12	30
8	4	23	15
11	6	11	100
13	8	11	1
14	4	11	30
16	1	17	2
7	2	25	18
19	2	17	2
1	1	12	64
15	1	25	34
22	3	24	5
24	10	23	8
25	11	23	7
6	3	12	0
5	3	25	5
29	11	11	20
30	12	23	10
31	13	23	1
32	13	25	2
23	9	23	6
33	9	25	1
10	6	23	245
26	6	25	55
35	14	23	5
36	15	23	44
\.


--
-- TOC entry 4964 (class 0 OID 20314)
-- Dependencies: 221
-- Data for Name: product_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_history (id, product_id, actor_id, action, location, "timestamp", notes, blockchain_hash) FROM stdin;
89	3	23	sale_created		2025-07-19 13:08:39.702496	Cantidad: 10	\N
90	3	25	sale_created		2025-07-19 13:54:05.632739	Cantidad: 5	\N
91	2	12	sale_created		2025-07-19 14:10:21.255167	Cantidad: 20	\N
92	1	12	sale_created		2025-07-20 15:31:04.96538	Cantidad: 5	\N
93	1	25	sale_created		2025-07-20 15:46:35.89644	Cantidad: 5	\N
94	1	17	sale_created		2025-07-20 15:51:42.170249	Cantidad: 3	\N
96	2	25	sale_created		2025-07-20 19:59:15.020612	Cantidad: 2	\N
97	1	12	sale_created		2025-07-20 20:21:16.970434	Cantidad: 4	\N
98	1	12	sale_created		2025-07-20 23:53:54.806915	Cantidad: 27	\N
99	3	25	sale_created		2025-07-20 23:54:53.637664	Cantidad: 5	\N
100	6	23	sale_created		2025-07-21 14:01:02.188266	Cantidad: 5	\N
102	3	12	sale_created		2025-07-21 14:01:26.460483	Cantidad: 5	\N
103	13	23	sale_created		2025-07-22 20:13:37.022962	Cantidad: 2	\N
104	9	23	sale_created		2025-07-22 20:16:01.292519	Cantidad: 1	\N
105	6	23	sale_created		2025-07-22 20:45:26.838202	Cantidad: 50	\N
\.


--
-- TOC entry 4970 (class 0 OID 20402)
-- Dependencies: 227
-- Data for Name: product_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_transfers (id, product_id, from_user_id, to_user_id, quantity, status, notes, blockchain_hash, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4962 (class 0 OID 20267)
-- Dependencies: 219
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, category, producer_id, origin, production_date, blockchain_hash, metadata_hash, is_active, created_at, updated_at, price) FROM stdin;
9	Iphone	16 pro max plus	Electronica	23	chinardo	2025-03-11	\N	0xdc119ecdedabaf647dd1e362b4d1bdcbfd00dd2ee30c8ca54ee47df9566a6d	t	2025-07-21 00:32:27.123773	2025-07-22 19:57:59.894338	1200.00
2	Aceite de Oliva Virgen	Aceite prensado en frío	Aceite	15	San Juan	2024-07-12	\N	\N	t	2025-07-19 12:42:49.217827	2025-07-19 12:42:49.217827	0.00
3	Queso Artesanal	Queso de cabra madurado	Lácteos	17	Córdoba	2024-07-13	\N	\N	t	2025-07-19 12:42:49.217827	2025-07-19 12:42:49.217827	0.00
15	gas	altoaaa	Otros	23	alto	2025-07-23	0x823b6da5008ffe5d3768cded9ffeec260208a6d96ff2c8ac88d6dde929b8368d	0x351488de851bfb2156d5c165e7144f06bb0b09dbba4cc8f723e787cf1b245d	f	2025-07-23 20:20:39.880778	2025-07-23 20:29:18.922946	4444.00
14	vvvv	vvvv	Arte	23	vvvv	2025-07-23	0x24766b5801522b891b78e8e89183bde3f7bdce54dd15874ef696ac8f4b776793	0x6a2ace455961d9dac7016bbff6884c290105ade3c193a22cac5b55e8e44fc912	f	2025-07-23 20:14:56.433678	2025-07-23 20:29:28.722513	99.00
12	preciooo	price	Otros	23	canada	2022-06-17	0x4b7655d4959217940aea6257b74d333ec01ea1c46f70ce8d3d01dce576285426	0x8aeb6743afca00b528e7924de44c4a69afef66c523b636d1f7129de53350a301	f	2025-07-22 19:49:28.318649	2025-07-23 20:29:29.399261	0.00
11	nombre	descr	Electronica	23	ori	2025-07-21	0x1684dd4590abc66ceadf23f409e5a1b4e94ee83cfd7942749af68a06ada2b150	0x458f9acc610c2113ce27a62cc67a178f7150068b70c86344c2c7233ba826b3	f	2025-07-21 01:06:39.881582	2025-07-23 20:29:29.809757	0.00
8	producto admin	admin	bebidas	11	admin	2025-07-19	\N	\N	t	2025-07-19 17:31:14.692619	2025-07-19 17:31:14.692619	0.00
4	pintura linda	obra de arte	farmaceutica	23	francia	2025-07-19	\N	0x43888da2146fe897102252d980459fbc6a8c9e09910225f2326837c7f61d67	t	2025-07-19 14:15:15.717432	2025-07-19 17:32:28.889988	0.00
1	Tomate Premium	Tomate fresco de huerta	Verdura	12	Mendoza	2024-07-10	\N	\N	f	2025-07-19 12:42:49.217827	2025-07-21 15:56:25.890857	0.00
6	vacuna	covid - 19	farmaceutica	23	Rusia	2025-07-03	\N	0x5a81a657a72a94fd459cd3efd7fe4bbdd8fa2467e035df2fe4d1ab83e36574	t	2025-07-19 14:20:30.270224	2025-07-22 19:33:12.274247	200.00
10	hash	hash	Otros	23	hash	2025-07-21	\N	\N	t	2025-07-21 00:37:50.812209	2025-07-22 19:33:12.274247	33.00
13	priceeeee	assasa	Otros	23	asdasd	2025-07-22	0x858156444f066b0e6fdf1ba167ba0dafeef19ee220f1e9767d499ba7e357babe	0xcc7cc3ebdd8a766a2499bcf0a35a2a3a3591238b768cae56e8469133409a54ed	t	2025-07-22 19:54:02.130149	2025-07-22 19:54:02.130149	77.00
\.


--
-- TOC entry 4966 (class 0 OID 20339)
-- Dependencies: 223
-- Data for Name: sale_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_transactions (id, product_id, seller_id, buyer_id, quantity, price_per_unit, total_amount, currency, status, location, notes, blockchain_hash, created_at, updated_at) FROM stdin;
11	2	12	25	20.00	50.00	1000.00	USD	confirmed			\N	2025-07-19 14:10:21.255167	2025-07-20 18:35:16.908417
14	1	17	25	3.00	200.00	600.00	USD	confirmed		comprar tomate	\N	2025-07-20 15:51:42.170249	2025-07-20 18:35:42.777484
13	1	25	17	5.00	50.00	250.00	USD	confirmed		vender tomate	\N	2025-07-20 15:46:35.89644	2025-07-20 18:41:51.66945
9	3	23	25	10.00	100.00	1000.00	USD	confirmed			\N	2025-07-19 13:08:39.702496	2025-07-20 18:57:39.896028
12	1	12	25	5.00	50.00	250.00	USD	confirmed		comprar tomate	\N	2025-07-20 15:31:04.96538	2025-07-20 19:02:29.698845
10	3	25	12	5.00	200.00	1000.00	USD	confirmed			\N	2025-07-19 13:54:05.632739	2025-07-20 19:02:31.260345
16	2	25	17	2.00	500.00	1000.00	USD	confirmed			\N	2025-07-20 19:59:15.020612	2025-07-20 20:00:10.799276
17	1	12	25	4.00	444.00	1776.00	USD	confirmed			\N	2025-07-20 20:21:16.970434	2025-07-20 20:26:28.264473
18	1	12	25	27.00	10.00	270.00	USD	confirmed			\N	2025-07-20 23:53:54.806915	2025-07-21 13:34:25.68823
19	3	25	24	5.00	599.00	2995.00	USD	confirmed			\N	2025-07-20 23:54:53.637664	2025-07-21 13:35:11.707303
20	6	23	25	5.00	5.00	25.00	USD	confirmed			\N	2025-07-21 14:01:02.188266	2025-07-21 14:10:40.075801
23	13	23	25	2.00	77.00	154.00	USD	confirmed		notas	\N	2025-07-22 20:13:37.022962	2025-07-22 20:14:49.403336
24	9	23	25	1.00	1200.00	1200.00	USD	confirmed			\N	2025-07-22 20:16:01.292519	2025-07-22 20:18:04.428098
25	6	23	25	50.00	200.00	10000.00	USD	confirmed			\N	2025-07-22 20:45:26.838202	2025-07-23 19:15:28.327503
22	3	12	25	5.00	5.00	25.00	USD	confirmed			\N	2025-07-21 14:01:26.460483	2025-07-23 19:16:14.875274
\.


--
-- TOC entry 4968 (class 0 OID 20374)
-- Dependencies: 225
-- Data for Name: shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipments (id, product_id, distributor_id, origin, destination, transport_company, quantity, status, notes, blockchain_hash, created_at, updated_at) FROM stdin;
15	1	24	Venta	pepe		5.00	delivered	tomatito	\N	2025-07-20 18:41:51.666885	2025-07-20 18:53:13.56999
14	1	24	Venta	tomas vendedor		3.00	delivered		\N	2025-07-20 18:35:42.771588	2025-07-20 18:53:23.921126
13	2	24	Venta	tomas vendedor		20.00	delivered	virgen	\N	2025-07-20 18:35:16.88393	2025-07-20 18:53:25.988668
12	1	24	Venta	tomas vendedor		5.00	delivered	premiuuum	\N	2025-07-20 18:11:51.31835	2025-07-20 18:53:28.0606
11	3	24	Venta	Tomas		5.00	delivered	Auto #10	\N	2025-07-20 18:01:17.985397	2025-07-20 18:53:30.234713
8	1	24	Tomas	tomas vendedor	Yo	5.00	delivered	yendo	\N	2025-07-20 17:39:09.793067	2025-07-20 18:53:40.563314
16	3	24	Venta	tomas vendedor	distri	10.00	cancelled		\N	2025-07-20 18:57:39.874017	2025-07-20 18:58:03.164043
17	1	24	Venta	tomas vendedor	distri	5.00	delivered		\N	2025-07-20 19:02:29.696845	2025-07-20 19:10:13.974867
18	3	24	Venta	Tomas	distri	5.00	cancelled		\N	2025-07-20 19:02:31.23817	2025-07-20 19:58:09.875468
19	2	24	Venta	pepe	distri	2.00	delivered	probando	\N	2025-07-20 20:00:10.775063	2025-07-20 20:04:27.997986
21	1	24	Venta	tomas vendedor	distri	4.00	delivered	otra	\N	2025-07-20 20:26:28.240392	2025-07-20 23:18:14.390439
22	1	24	Venta	tomas vendedor	distri	27.00	delivered	opcional	\N	2025-07-21 13:34:25.681506	2025-07-21 13:35:40.171731
23	3	24	Venta	distri	distri	5.00	cancelled	2	\N	2025-07-21 13:35:11.702099	2025-07-21 13:45:38.24462
24	6	24	Venta	tomas vendedor	distri	5.00	delivered	1	\N	2025-07-21 14:10:40.024896	2025-07-21 14:22:03.455725
27	9	24	Venta	tomas vendedor	distri	1.00	delivered		\N	2025-07-22 20:18:04.40415	2025-07-22 20:18:38.913659
26	13	24	Venta	tomas vendedor	distri	2.00	delivered	y	\N	2025-07-22 20:14:49.397635	2025-07-23 19:14:50.611404
28	6	24	Venta	tomas vendedor	distri	50.00	delivered	sin base de datos	\N	2025-07-23 19:15:28.319084	2025-07-23 19:15:48.914445
29	3	24	Venta	tomas vendedor	distri	5.00	in_transit		\N	2025-07-23 19:16:14.849635	2025-07-23 19:16:14.849635
\.


--
-- TOC entry 4972 (class 0 OID 20436)
-- Dependencies: 229
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (id, config_key, config_value, description, is_active, created_at, updated_at) FROM stdin;
1	blockchain_network	ethereum	Red blockchain principal	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
2	contract_user_registration		Dirección del contrato de registro de usuarios	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
3	contract_product_registration		Dirección del contrato de registro de productos	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
4	contract_sale_transaction		Dirección del contrato de transacciones de venta	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
5	contract_shipment_registration		Dirección del contrato de registro de envíos	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
6	contract_product_transfer		Dirección del contrato de transferencia de productos	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
7	ipfs_gateway	https://ipfs.io/ipfs/	Gateway IPFS para metadatos	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
8	max_file_size	10485760	Tamaño máximo de archivo en bytes (10MB)	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
9	supported_file_types	jpg,jpeg,png,pdf,doc,docx	Tipos de archivo soportados	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
10	email_notifications	true	Habilitar notificaciones por email	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
11	blockchain_confirmations	3	Número de confirmaciones requeridas	t	2025-07-15 20:47:23.604239	2025-07-15 20:47:23.604239
\.


--
-- TOC entry 4974 (class 0 OID 20452)
-- Dependencies: 231
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, user_id, action, entity_type, entity_id, ip_address, user_agent, details, created_at) FROM stdin;
3	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-15 23:04:22.292123-03
5	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 10:43:24.686921-03
6	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 10:43:55.784426-03
7	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 10:45:59.709184-03
8	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 10:46:27.801785-03
1	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-15 22:28:46.571561-03
2	\N	login	\N	\N	::1	PostmanRuntime/7.44.1	\N	2025-07-15 22:46:19.205822-03
4	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-15 23:40:49.104537-03
9	\N	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 10:46:46.457101-03
10	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 11:13:51.289241-03
11	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 11:23:58.307729-03
12	11	user_created	user	12	\N	\N	{"name": "Tomas", "role": "producer", "email": "tomas@gmail.com"}	2025-07-16 11:29:12.394568-03
13	12	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 11:29:56.3329-03
14	12	product_created	product	13	\N	\N	{"name": "tomas 1", "category": "alimentos", "description": "producto 1"}	2025-07-16 11:38:42.514829-03
15	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 12:16:55.252152-03
16	11	product_created	product	14	\N	\N	{"name": "admin 1", "category": "electro", "description": "producto admin"}	2025-07-16 12:17:24.814373-03
17	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 12:18:34.44947-03
18	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 12:24:41.498499-03
19	11	user_deleted	user	12	\N	\N	{"name": "Tomas"}	2025-07-16 12:31:24.772436-03
20	12	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 12:31:57.557831-03
21	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 12:32:11.758971-03
22	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 12:37:24.994806-03
23	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:04:14.043936-03
24	11	user_created	user	13	\N	\N	{"name": "vendedor 1", "role": "seller", "email": "vendedor@trackchain.com"}	2025-07-16 15:05:10.427382-03
25	11	user_created	user	14	\N	\N	{"name": "distribuidor 1", "role": "distributor", "email": "distribuidor@trackchain.com"}	2025-07-16 15:05:34.158198-03
26	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:12:56.317941-03
27	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:34:16.356893-03
28	11	user_updated	user	14	\N	\N	{"name": "distribuidor 1", "role": "distributor", "email": "distribuidor1@trackchain.com"}	2025-07-16 15:35:28.896864-03
29	11	user_updated	user	11	\N	\N	{"name": "Admin", "role": "admin", "email": "admin@trackchain.com"}	2025-07-16 15:36:05.246164-03
30	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:36:20.965629-03
31	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:36:29.374957-03
32	11	user_updated	user	11	\N	\N	{"name": "Admin", "role": "admin", "email": "admin@trackchain.com"}	2025-07-16 15:36:36.591971-03
33	11	user_updated	user	14	\N	\N	{"name": "distribuidor 1", "role": "producer", "email": "distribuidor1@trackchain.com"}	2025-07-16 15:36:58.890616-03
34	11	user_updated	user	14	\N	\N	{"name": "distribuidor 1", "role": "distributor", "email": "distribuidor1@trackchain.com"}	2025-07-16 15:37:09.635259-03
35	12	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:40:26.431893-03
36	12	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:41:12.608076-03
37	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 15:55:38.563921-03
38	11	product_created	product	15	\N	\N	{"name": "producto real", "category": "algo", "description": "real"}	2025-07-16 15:56:17.708043-03
39	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 16:13:36.866466-03
40	11	product_created	product	16	\N	\N	{"name": "real 2", "category": "realisimo", "description": "re real"}	2025-07-16 16:14:11.349499-03
41	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 17:24:48.02738-03
42	11	user_updated	user	14	\N	\N	{"name": "distribuidor", "role": "distributor", "email": "distribuidor@trackchain.com"}	2025-07-16 19:19:53.710538-03
43	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 19:40:15.922453-03
44	11	user_created	user	15	\N	\N	{"name": "Usuario real", "role": "producer", "email": "usuario@gmail.com"}	2025-07-16 19:40:56.132522-03
45	11	user_created	user	16	\N	\N	{"name": "usuario 2", "role": "producer", "email": "nombre@gmail.com"}	2025-07-16 19:49:52.908398-03
46	11	user_created	user	17	\N	\N	{"name": "pepe", "role": "producer", "email": "pepe@gmail.com"}	2025-07-16 19:54:09.463886-03
47	11	product_created	product	17	\N	\N	{"name": "produ", "category": "piola", "description": "cto"}	2025-07-16 20:04:48.035918-03
48	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-16 20:42:51.003449-03
49	11	product_created	product	18	\N	\N	{"name": "pastill", "category": "farmaceutica", "description": "pastilla"}	2025-07-16 20:43:25.507269-03
50	11	product_created	product	19	\N	\N	{"name": "carne", "category": "carnes", "description": "carne"}	2025-07-16 21:03:29.758929-03
51	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-16 21:24:14.657975-03
52	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 12:18:01.200265-03
53	11	product_created	product	20	\N	\N	{"name": "dwwd", "category": "dwwddwwd", "description": "wdwdwd"}	2025-07-17 12:30:16.200933-03
54	11	product_created	product	21	\N	\N	{"name": "Tomas", "category": "lacteos", "description": "dasasd"}	2025-07-17 12:31:07.231496-03
55	11	product_created	product	22	\N	\N	{"name": "producto 2", "category": "bebidas", "description": "2"}	2025-07-17 12:31:39.547415-03
56	11	user_created	user	19	\N	\N	{"name": "potramo", "role": "distributor", "email": "potamo@gmail.com"}	2025-07-17 12:33:38.874538-03
57	11	user_deleted	user	19	\N	\N	{"name": "potramo"}	2025-07-17 12:34:11.068084-03
58	11	user_created	user	20	\N	\N	{"name": "potamo", "role": "distributor", "email": "pota@gmail.com"}	2025-07-17 12:34:36.64509-03
59	11	user_created	user	21	\N	\N	{"name": "probando", "role": "distributor", "email": "probando@gmail.com"}	2025-07-17 12:38:51.648507-03
60	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 12:50:18.037735-03
61	11	product_created	product	23	\N	\N	{"name": "nuevo", "category": "carnes", "description": "novo"}	2025-07-17 12:55:23.4593-03
62	11	product_created	product	24	\N	\N	{"name": "otro", "category": "bebidas", "description": "otro"}	2025-07-17 12:58:44.520456-03
63	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 14:25:54.67107-03
64	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 14:38:24.488841-03
65	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 15:14:46.815905-03
66	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 15:17:42.543258-03
67	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 15:26:56.322184-03
68	11	product_created	product	25	\N	\N	{"name": "Tomas", "category": "alimentos", "description": "1"}	2025-07-17 15:58:33.140065-03
69	11	product_created	product	26	\N	\N	{"name": "2", "category": "carnes", "description": "2"}	2025-07-17 16:01:57.951028-03
70	11	product_created	product	27	\N	\N	{"name": "3", "category": "bebidas", "description": "3"}	2025-07-17 16:03:34.742812-03
71	11	product_created	product	28	\N	\N	{"name": "otro", "category": "farmaceutica", "description": "otro"}	2025-07-17 16:09:55.966964-03
72	11	product_created	product	29	\N	\N	{"name": "nuevo", "category": "farmaceutica", "description": "nue"}	2025-07-17 16:14:51.95937-03
73	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 16:24:51.240439-03
74	11	product_created	product	30	\N	\N	{"name": "bloc", "category": "carnes", "description": "chain"}	2025-07-17 16:25:42.393651-03
75	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 16:30:54.305364-03
76	11	product_created	product	31	\N	\N	{"name": "Real 1", "category": "alimentos", "description": "real"}	2025-07-17 16:38:40.658829-03
77	11	user_created	user	23	\N	\N	{"name": "productor", "role": "producer", "email": "produ@gmail.com"}	2025-07-17 16:57:37.256261-03
78	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 16:58:32.866008-03
79	23	product_created	product	32	\N	\N	{"name": "producto", "category": "bebidas", "description": "producto"}	2025-07-17 16:59:20.518421-03
80	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 17:03:06.005977-03
81	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 17:58:35.789445-03
82	11	user_created	user	24	\N	\N	{"name": "distri", "role": "distributor", "email": "distri@gmail.com"}	2025-07-17 17:59:42.893387-03
83	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 18:00:18.932421-03
84	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 18:15:56.932356-03
85	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 18:22:53.403138-03
86	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 18:27:19.816809-03
87	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 18:29:37.361525-03
88	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 18:37:25.903802-03
89	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 18:51:09.009384-03
90	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 19:14:24.479795-03
91	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 19:32:27.117498-03
92	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 19:43:30.515787-03
93	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 20:45:23.48792-03
94	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-17 21:07:35.964632-03
95	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 11:42:38.537985-03
96	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 12:35:01.214689-03
97	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 12:35:57.436128-03
98	13	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 12:39:22.100988-03
99	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 14:01:00.994855-03
100	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 14:02:43.764592-03
101	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 14:08:27.186262-03
102	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 14:16:20.440696-03
103	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 14:25:46.59825-03
104	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:09:57.078025-03
105	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:12:38.90574-03
106	11	user_created	user	25	\N	\N	{"name": "tomas vendedor", "role": "seller", "email": "vend@gmail.com"}	2025-07-18 16:14:12.688438-03
107	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:14:45.554052-03
108	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:35:43.667573-03
109	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:37:26.981634-03
110	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:39:02.944364-03
111	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:57:12.704963-03
112	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 16:57:25.420368-03
113	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 17:03:08.273926-03
114	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 17:03:49.481397-03
115	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 17:17:33.852207-03
116	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 17:18:39.102338-03
117	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 17:22:09.644027-03
118	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 18:41:45.656221-03
119	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 18:42:12.504485-03
120	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 19:09:12.245479-03
121	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 19:21:57.815944-03
122	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 19:27:30.161717-03
123	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 19:33:03.603856-03
124	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	\N	2025-07-18 19:40:24.59259-03
125	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 19:42:26.553403-03
126	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 19:52:54.341562-03
127	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 20:07:47.556382-03
128	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 20:29:15.923492-03
129	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 20:47:55.751609-03
130	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 20:48:18.281632-03
131	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 21:08:40.153827-03
132	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 21:23:23.688169-03
133	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 21:31:13.29071-03
134	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-18 21:34:24.935032-03
135	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 10:33:58.812319-03
136	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 10:43:55.870091-03
137	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 10:45:17.198089-03
138	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 10:45:56.073209-03
139	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 10:52:01.960892-03
140	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 10:55:27.860081-03
141	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 10:59:29.938024-03
142	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 11:03:17.706388-03
143	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 11:12:06.133822-03
144	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 11:13:32.210458-03
145	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 11:24:05.303034-03
146	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 11:39:47.609823-03
147	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 11:42:36.890487-03
148	25	transaction_created	transaction	3	\N	\N	{"product_id": 26, "total_amount": 400}	2025-07-19 11:51:23.408035-03
149	25	transaction_created	transaction	4	\N	\N	{"product_id": 26, "total_amount": 400}	2025-07-19 11:56:54.445363-03
150	25	transaction_created	transaction	5	\N	\N	{"product_id": 26, "total_amount": 300}	2025-07-19 12:11:05.562097-03
151	25	transaction_created	transaction	6	\N	\N	{"product_id": 26, "total_amount": 80}	2025-07-19 12:15:28.116183-03
152	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 12:20:29.758098-03
153	25	transaction_created	transaction	7	\N	\N	{"product_id": 26, "total_amount": 300}	2025-07-19 12:22:21.732717-03
154	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 12:27:08.771217-03
155	25	transaction_created	transaction	8	\N	\N	{"product_id": 26, "total_amount": 50}	2025-07-19 12:27:27.405664-03
156	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 12:43:25.54983-03
157	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 12:57:41.345098-03
158	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 13:05:39.218524-03
159	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 13:05:57.609133-03
160	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 13:06:19.70493-03
161	23	transaction_created	transaction	9	\N	\N	{"product_id": 3, "total_amount": 1000}	2025-07-19 13:08:39.702496-03
162	25	transaction_created	transaction	10	\N	\N	{"product_id": 3, "total_amount": 1000}	2025-07-19 13:54:05.632739-03
163	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 14:02:22.250337-03
164	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 14:03:37.619597-03
165	12	transaction_created	transaction	11	\N	\N	{"product_id": 2, "total_amount": 1000}	2025-07-19 14:10:21.255167-03
166	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 14:13:07.945-03
167	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 14:13:48.61111-03
168	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 14:16:12.922709-03
169	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 14:28:23.108765-03
170	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 15:04:05.853405-03
171	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 15:24:04.006434-03
172	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 16:18:11.569269-03
173	11	user_deleted	user	16	\N	\N	{"name": "usuario 2"}	2025-07-19 16:24:38.238529-03
174	11	user_created	user	27	\N	\N	{"name": "nuevo usuario", "role": "producer", "email": "nuevo@gmail.com"}	2025-07-19 16:35:53.378058-03
175	11	user_updated	user	27	\N	\N	{"name": "nuevo usuario productor", "role": "producer", "email": "nuevo@gmail.com"}	2025-07-19 16:36:55.741319-03
176	27	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 16:41:03.783162-03
177	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 16:43:10.272038-03
178	27	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 16:55:36.197553-03
179	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-19 17:24:28.289886-03
180	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 15:21:06.63794-03
181	12	transaction_created	transaction	12	\N	\N	{"product_id": 1, "total_amount": 250}	2025-07-20 15:31:04.96538-03
182	25	transaction_created	transaction	13	\N	\N	{"product_id": 1, "total_amount": 250}	2025-07-20 15:46:35.89644-03
183	17	transaction_created	transaction	14	\N	\N	{"product_id": 1, "total_amount": 600}	2025-07-20 15:51:42.170249-03
184	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 15:58:42.403725-03
185	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:02:18.25366-03
186	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:06:39.541413-03
187	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:09:54.955433-03
188	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:16:22.098938-03
189	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:28:17.475376-03
190	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:30:15.606321-03
191	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:58:27.564476-03
192	27	transaction_created	transaction	15	\N	\N	{"product_id": 7, "total_amount": 900}	2025-07-20 19:59:07.06681-03
193	25	transaction_created	transaction	16	\N	\N	{"product_id": 2, "total_amount": 1000}	2025-07-20 19:59:15.020612-03
194	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 19:59:49.833851-03
195	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 20:15:25.679129-03
196	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 20:20:43.78665-03
197	12	transaction_created	transaction	17	\N	\N	{"product_id": 1, "total_amount": 1776}	2025-07-20 20:21:16.970434-03
198	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 20:21:41.758829-03
199	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 23:43:15.255671-03
200	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-20 23:43:52.302453-03
201	12	transaction_created	transaction	18	\N	\N	{"product_id": 1, "total_amount": 270}	2025-07-20 23:53:54.806915-03
202	25	transaction_created	transaction	19	\N	\N	{"product_id": 3, "total_amount": 2995}	2025-07-20 23:54:53.637664-03
203	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 00:14:56.902723-03
204	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 00:15:32.775422-03
205	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 00:15:42.288299-03
206	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 00:15:59.38966-03
207	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 00:16:47.971307-03
208	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 00:21:10.290357-03
209	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 00:23:56.655403-03
210	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 11:59:48.576526-03
211	11	user_created	user	28	\N	\N	{"name": "pepe potamoi", "role": "distributor", "email": "potamos@gmail.com"}	2025-07-21 12:00:22.117149-03
212	11	user_created	user	29	\N	\N	{"name": "crac", "role": "distributor", "email": "cra@gmail.com"}	2025-07-21 12:09:28.97216-03
213	11	user_updated	user	29	\N	\N	{"name": "crac", "role": "distributor", "email": "cra@gmail.com"}	2025-07-21 12:10:02.345944-03
214	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 13:33:47.723674-03
215	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:00:36.697263-03
216	23	transaction_created	transaction	20	\N	\N	{"product_id": 6, "total_amount": 25}	2025-07-21 14:01:02.188266-03
217	27	transaction_created	transaction	21	\N	\N	{"product_id": 7, "total_amount": 25}	2025-07-21 14:01:13.732719-03
218	12	transaction_created	transaction	22	\N	\N	{"product_id": 3, "total_amount": 25}	2025-07-21 14:01:26.460483-03
219	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:01:34.527046-03
220	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:28:04.115474-03
221	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:35:53.680575-03
222	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:36:51.953013-03
223	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:37:45.184115-03
224	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:40:14.117646-03
225	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 OPR/119.0.0.0	\N	2025-07-21 14:40:32.477378-03
226	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-21 15:38:49.319251-03
227	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 15:53:17.230938-03
228	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 15:57:50.520865-03
229	11	user_created	user	30	\N	\N	{"name": "probando", "role": "distributor", "email": "proba@gmail.com"}	2025-07-22 16:47:59.540256-03
230	11	user_deleted	user	30	\N	\N	{"name": "probando"}	2025-07-22 16:48:08.028088-03
231	11	user_created	user	31	\N	\N	{"name": "otra", "role": "seller", "email": "otra@gmail.com"}	2025-07-22 16:57:16.883223-03
232	11	user_deleted	user	31	\N	\N	{"name": "otra"}	2025-07-22 17:00:52.0352-03
233	11	user_created	user	32	\N	\N	{"name": "pepes", "role": "producer", "email": "pepes@gmail.com"}	2025-07-22 17:10:39.641665-03
234	11	user_deleted	user	32	\N	\N	{"name": "pepes"}	2025-07-22 17:11:20.18705-03
235	11	user_created	user	34	\N	\N	{"name": "tststst", "role": "producer", "email": "ttts@gmail.com"}	2025-07-22 17:23:02.250397-03
236	11	user_updated	user	34	\N	\N	{"name": "tetas", "role": "distributor", "email": "ttts@gmail.com"}	2025-07-22 17:41:12.242846-03
237	11	user_updated	user	34	\N	\N	{"name": "tttttt", "role": "distributor", "email": "ttts@gmail.com"}	2025-07-22 17:43:52.817313-03
238	11	user_updated	user	34	\N	\N	{"name": "editado", "role": "producer", "email": "ttts@gmail.com"}	2025-07-22 18:44:36.868108-03
239	11	user_updated	user	34	\N	\N	{"name": "editado", "role": "seller", "email": "editado@gmail.com"}	2025-07-22 18:47:25.812668-03
240	11	user_updated	user	34	\N	\N	{"name": "editado2", "role": "seller", "email": "editado@gmail.com"}	2025-07-22 18:47:52.06706-03
241	11	user_updated	user	34	\N	\N	{"name": "otra mas", "role": "seller", "email": "editado@gmail.com.ar"}	2025-07-22 18:48:35.134607-03
242	11	user_updated	user	34	\N	\N	{"name": "otra mas 2", "role": "seller", "email": "editado@gmail.com.ar"}	2025-07-22 18:52:15.519059-03
243	11	user_updated	user	34	\N	\N	{"name": "otra mas 2", "role": "seller", "email": "2222@gmail.com.ar"}	2025-07-22 18:52:22.242596-03
244	11	user_updated	user	34	\N	\N	{"name": "otra mas 3", "role": "seller", "email": "2222@gmail.com.ar"}	2025-07-22 18:53:51.499424-03
245	11	user_updated	user	34	\N	\N	{"name": "otra mas 4", "role": "seller", "email": "2222@gmail.com.ar"}	2025-07-22 18:57:20.979197-03
246	11	user_created	user	35	\N	\N	{"name": "novo", "role": "seller", "email": "novo@gmail.com"}	2025-07-22 19:00:14.402457-03
247	11	user_deleted	user	35	\N	\N	{"name": "novo"}	2025-07-22 19:00:23.268678-03
248	11	user_created	user	36	\N	\N	{"name": "novos", "role": "seller", "email": "no@gmail.com"}	2025-07-22 19:02:02.23879-03
249	11	user_updated	user	36	\N	\N	{"name": "novos", "role": "seller", "email": "nostro@gmail.com"}	2025-07-22 19:02:27.006104-03
250	11	user_updated	user	36	\N	\N	{"name": "novos", "role": "distributor", "email": "nostro@gmail.com"}	2025-07-22 19:03:49.63867-03
251	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 19:27:29.494296-03
252	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 19:32:23.344015-03
253	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 19:39:13.011897-03
254	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 20:00:59.635887-03
255	23	transaction_created	transaction	23	\N	\N	{"product_id": 13, "total_amount": 154}	2025-07-22 20:13:37.022962-03
256	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 20:14:14.62532-03
257	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 20:15:11.81315-03
258	23	transaction_created	transaction	24	\N	\N	{"product_id": 9, "total_amount": 1200}	2025-07-22 20:16:01.292519-03
259	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 20:16:22.460426-03
260	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 20:23:36.858835-03
261	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 20:42:12.974298-03
262	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 20:43:46.411914-03
263	23	transaction_created	transaction	25	\N	\N	{"product_id": 6, "total_amount": 10000}	2025-07-22 20:45:26.838202-03
264	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 21:59:48.442293-03
265	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-22 22:02:19.308343-03
266	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 10:54:40.995645-03
267	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:13:48.423969-03
268	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:14:10.842449-03
269	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:33:02.596536-03
270	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:37:25.119574-03
271	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:38:05.460541-03
272	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:40:11.723971-03
273	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:41:36.236792-03
274	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:46:01.195697-03
275	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 11:50:38.015093-03
276	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 12:03:31.744473-03
277	11	user_created	user	37	\N	\N	{"name": "definitivo produ", "role": "producer", "email": "def@gmail.com"}	2025-07-23 12:05:16.259451-03
278	11	user_updated	user	37	\N	\N	{"name": "definitivo product", "role": "producer", "email": "def@gmail.com"}	2025-07-23 12:06:22.248921-03
279	11	user_updated	user	37	\N	\N	{"name": "definitivo product", "role": "producer", "email": "def@gmail.com"}	2025-07-23 12:06:22.973365-03
280	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:13:57.263228-03
281	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:14:16.621214-03
282	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:16:26.264344-03
283	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:16:51.613668-03
284	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:28:17.782729-03
285	11	user_created	user	38	\N	\N	{"name": "mercado li", "role": "seller", "email": "li@gmail.com"}	2025-07-23 19:29:24.2711-03
286	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:29:44.793319-03
287	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:33:17.263113-03
288	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:37:30.59819-03
289	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:49:43.625315-03
290	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:49:53.044358-03
291	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:50:11.11204-03
292	24	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:50:28.716924-03
293	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 19:50:40.271252-03
294	23	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 20:12:43.693229-03
295	11	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-23 20:28:32.867354-03
296	25	login	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 OPR/120.0.0.0	\N	2025-07-24 12:45:42.690583-03
\.


--
-- TOC entry 4975 (class 0 OID 20471)
-- Dependencies: 232
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, ip_address, user_agent, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 4960 (class 0 OID 20246)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, wallet_address, is_active, created_at, updated_at) FROM stdin;
29	crac	cra@gmail.com	$2b$10$xpHaXxk1m6wToq209tNoq.yShUvA9YOBiDPjjuo8uIw4vm1bJiPGa	distributor	0x2b8Fcc2bE8B3B165FEA3D4144f0FdE51A9D3a2be	t	2025-07-21 12:09:28.970254	2025-07-21 12:10:02.316398
12	Tomas	tomas@gmail.com	$2b$10$FJ2PXutUnz.S7BcqMispV.jfLBWQKQQeinkH/EhA1EgxZeYi09MZW	producer	\N	t	2025-07-16 11:29:12.39286	2025-07-16 12:38:19.400328
13	vendedor 1	vendedor@trackchain.com	$2b$10$w/gfD.gaUqsIzEowJ3pOD.GMNM4JoNCi5Z4hgKK/QRL7aPWy/e9mq	seller	\N	t	2025-07-16 15:05:10.42521	2025-07-16 15:05:10.42521
30	probando	proba@gmail.com	$2b$10$/VVLEBJSKLi7v2HquFBKdu.9VwfHQx6nocZrS.9h.nPHSOarltHnS	distributor	\N	f	2025-07-22 16:47:59.537534	2025-07-22 16:48:08.018386
11	Admin	admin@trackchain.com	$2b$10$ard3x1ztAmA.gZmBjc9qt.x5W12AXkx82Atf/7kfFW1TOd64FgMnO	admin	\N	t	2025-07-16 11:13:05.342806	2025-07-16 15:36:36.587965
14	distribuidor	distribuidor@trackchain.com	$2b$10$3l5pbWiXSlz2EFfvssx42uAqN1/c8MGSAuzxZtu/fS/3oLgESBTcS	distributor	\N	t	2025-07-16 15:05:34.156037	2025-07-16 19:19:53.702444
15	Usuario real	usuario@gmail.com	$2b$10$1bP23rCxeiQ6nX3vCxxZO.p8nTZjwpNviqefey6mLD2wJ5oeK/LhS	producer	\N	t	2025-07-16 19:40:56.110874	2025-07-16 19:40:56.110874
17	pepe	pepe@gmail.com	$2b$10$e4sxM8DHAhkQ9YRA3STy4O1NQkWYSxq.8WD1IRrKU01I7m1oUpYu6	producer	0xf63092E838A233f75A720FDbC899cbB49D08f2Ce	t	2025-07-16 19:54:09.441946	2025-07-16 19:54:09.441946
19	potramo	potamo@gmail.com	$2b$10$P7OIRVGhPpJ339fFlUHX4ey1v5j/vHzhL0VdAbOVDnl7OmXs1GlOm	distributor	0xf63092E838A233f75A720FDbC899cbB49D08f2C2	f	2025-07-17 12:33:38.85282	2025-07-17 12:34:11.044641
20	potamo	pota@gmail.com	$2b$10$CAFIQgJhRtilh7Xy5dsYiem17dVY8hviR9W2coguw0ujh/lPtSXiK	distributor	0xf63092E838A233f73A720FDbC899cbB49D08f2Ce	t	2025-07-17 12:34:36.623224	2025-07-17 12:34:36.623224
21	probando	probando@gmail.com	$2b$10$o7JXQIiw/C5cld0esUYYzOws9KnpQSpnTEhJrlYs10xm3KvMt.BE2	distributor	0xAD6B998c92c9E7123Dc719425696ebfC40aB72a6	t	2025-07-17 12:38:51.646586	2025-07-17 12:38:51.646586
23	productor	produ@gmail.com	$2b$10$ROcmSVkPhG.Z1ksYY.NA0.yGDWB3ZVf4hEbK1yZSbEn6OK3L0Onq.	producer	0x912B990BF5CbBfc7011876846029379ae7B3EE54	t	2025-07-17 16:57:37.254071	2025-07-17 16:57:37.254071
24	distri	distri@gmail.com	$2b$10$XFQ5uCD81SNzGst7d9tpiOdTMZK3LB7EKsltoRFKYXfFkEpRZWxVm	distributor	0xDA4ebc162dd64Ccc49D050C8d6f7dB2DffC07fB9	t	2025-07-17 17:59:42.870436	2025-07-17 17:59:42.870436
25	tomas vendedor	vend@gmail.com	$2b$10$5HAHCn9JaNU9aT2O65B/T.GIrpLG.aMrpLEUv3yFVg1euNLjhiu4O	seller	0xd37034DBc9BA2871E7c793A6e3f194eb291f035a	t	2025-07-18 16:14:12.685835	2025-07-18 16:14:12.685835
16	usuario 2	nombre@gmail.com	$2b$10$cPVuRd/KKGAHg0gRj3T9TOugKXNodCi8WgvbHW/e1w9xnXFmuIiZa	producer	\N	f	2025-07-16 19:49:52.90636	2025-07-19 16:24:38.215083
27	nuevo usuario productor	nuevo@gmail.com	$2b$10$4fTOpyjTD99jkDc7KMbmieuIKnTgfs8FWwwp7UIhzpdhrHw0YhBvm	producer	0x7252e641FffdDf88F521840431F13EFC1Ac55a10	t	2025-07-19 16:35:53.3763	2025-07-19 16:36:55.71786
28	pepe potamoi	potamos@gmail.com	$2b$10$OEogolUzuqeslFhmbbzcnO04czH0.EGAtQ.zsMIOIL7eQnyQscrHC	distributor	0x5876Ed8955E9b31B7Da9688Dd050A88585742c1E	t	2025-07-21 12:00:22.115507	2025-07-21 12:00:22.115507
31	otra	otra@gmail.com	$2b$10$.zeUZVikSA6DODQBhz/9puOZD5BLvvLSGgUd31Mz4fnZ0ilrG2MTi	seller	\N	f	2025-07-22 16:57:16.861461	2025-07-22 17:00:52.030749
32	pepes	pepes@gmail.com	$2b$10$mu7P16gipdXW5UwvwQ0zMe21/crzCSac1rBYPU9XOxJISaRQrc1Xi	producer		f	2025-07-22 17:10:39.6344	2025-07-22 17:11:20.162814
37	definitivo product	def@gmail.com	$2b$10$ivDgkiJ0WaMFID5eB.OeU.lbO8ES7asYkCd6xVTHtmhDaHaGhJJLq	producer	0xc9573085841a13A30E7B238ab2049f1CFdDC14c9	t	2025-07-23 12:05:16.236711	2025-07-23 12:06:22.972211
38	mercado li	li@gmail.com	$2b$10$e.5CanrSETar9CRsR7rS2uk5.LQaDaMpUucNS0x2ae2x1QkjwK572	seller	0x214855c00229B250BB4f8755c60F8A173923140A	t	2025-07-23 19:29:24.249439	2025-07-23 19:29:24.249439
34	otra mas 4	2222@gmail.com.ar	$2b$10$BDa809uYrLgG.feOpYwf2OklpszaG59n59Z7h80a4TCZAfe7Wl94C	seller	0x6Dfb2FB646f0B1D5CF39678Fd355b7989E39eF77	t	2025-07-22 17:23:02.248332	2025-07-22 18:57:20.954985
35	novo	novo@gmail.com	$2b$10$pRTVbmHQsnr8.7.PKNEFTe44g3/wjn2UudQoxBpiqGbBVM79HoQyW	seller	\N	f	2025-07-22 19:00:14.397387	2025-07-22 19:00:23.264941
36	novos	nostro@gmail.com	$2b$10$6QNVPS36RppHKQYV3jD2Mu8FuRrQe/PwCoze2QZADTfTA.8Kckr5.	distributor	0x1aa64753882BB491003cFfb32d9f0B4BeF8e43d0	t	2025-07-22 19:02:02.236032	2025-07-22 19:03:49.614899
\.


--
-- TOC entry 4993 (class 0 OID 0)
-- Dependencies: 233
-- Name: product_custodies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_custodies_id_seq', 36, true);


--
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 220
-- Name: product_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_history_id_seq', 105, true);


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 226
-- Name: product_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_transfers_id_seq', 8, true);


--
-- TOC entry 4996 (class 0 OID 0)
-- Dependencies: 218
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 15, true);


--
-- TOC entry 4997 (class 0 OID 0)
-- Dependencies: 222
-- Name: sale_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_transactions_id_seq', 25, true);


--
-- TOC entry 4998 (class 0 OID 0)
-- Dependencies: 224
-- Name: shipments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shipments_id_seq', 29, true);


--
-- TOC entry 4999 (class 0 OID 0)
-- Dependencies: 228
-- Name: system_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_config_id_seq', 11, true);


--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 230
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 296, true);


--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 216
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 38, true);


--
-- TOC entry 4792 (class 2606 OID 20522)
-- Name: product_custodies product_custodies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 20524)
-- Name: product_custodies product_custodies_product_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_product_id_user_id_key UNIQUE (product_id, user_id);


--
-- TOC entry 4750 (class 2606 OID 20322)
-- Name: product_history product_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history
    ADD CONSTRAINT product_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 20413)
-- Name: product_transfers product_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_pkey PRIMARY KEY (id);


--
-- TOC entry 4743 (class 2606 OID 20277)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4758 (class 2606 OID 20351)
-- Name: sale_transactions sale_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4765 (class 2606 OID 20385)
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 20448)
-- Name: system_config system_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_config_key_key UNIQUE (config_key);


--
-- TOC entry 4779 (class 2606 OID 20446)
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 20460)
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4790 (class 2606 OID 20478)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 20259)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4734 (class 2606 OID 20257)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4736 (class 2606 OID 20261)
-- Name: users users_wallet_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_wallet_address_key UNIQUE (wallet_address);


--
-- TOC entry 4744 (class 1259 OID 20335)
-- Name: idx_product_history_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_action ON public.product_history USING btree (action);


--
-- TOC entry 4745 (class 1259 OID 20334)
-- Name: idx_product_history_actor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_actor_id ON public.product_history USING btree (actor_id);


--
-- TOC entry 4746 (class 1259 OID 20337)
-- Name: idx_product_history_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_blockchain_hash ON public.product_history USING btree (blockchain_hash);


--
-- TOC entry 4747 (class 1259 OID 20333)
-- Name: idx_product_history_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_product_id ON public.product_history USING btree (product_id);


--
-- TOC entry 4748 (class 1259 OID 20336)
-- Name: idx_product_history_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_history_timestamp ON public.product_history USING btree ("timestamp");


--
-- TOC entry 4766 (class 1259 OID 20433)
-- Name: idx_product_transfers_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_blockchain_hash ON public.product_transfers USING btree (blockchain_hash);


--
-- TOC entry 4767 (class 1259 OID 20434)
-- Name: idx_product_transfers_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_created_at ON public.product_transfers USING btree (created_at);


--
-- TOC entry 4768 (class 1259 OID 20430)
-- Name: idx_product_transfers_from_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_from_user_id ON public.product_transfers USING btree (from_user_id);


--
-- TOC entry 4769 (class 1259 OID 20429)
-- Name: idx_product_transfers_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_product_id ON public.product_transfers USING btree (product_id);


--
-- TOC entry 4770 (class 1259 OID 20432)
-- Name: idx_product_transfers_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_status ON public.product_transfers USING btree (status);


--
-- TOC entry 4771 (class 1259 OID 20431)
-- Name: idx_product_transfers_to_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_transfers_to_user_id ON public.product_transfers USING btree (to_user_id);


--
-- TOC entry 4737 (class 1259 OID 20291)
-- Name: idx_products_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_blockchain_hash ON public.products USING btree (blockchain_hash);


--
-- TOC entry 4738 (class 1259 OID 20290)
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category ON public.products USING btree (category);


--
-- TOC entry 4739 (class 1259 OID 20292)
-- Name: idx_products_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_is_active ON public.products USING btree (is_active);


--
-- TOC entry 4740 (class 1259 OID 20288)
-- Name: idx_products_producer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_producer_id ON public.products USING btree (producer_id);


--
-- TOC entry 4741 (class 1259 OID 20293)
-- Name: idx_products_production_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_production_date ON public.products USING btree (production_date);


--
-- TOC entry 4751 (class 1259 OID 20371)
-- Name: idx_sale_transactions_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_blockchain_hash ON public.sale_transactions USING btree (blockchain_hash);


--
-- TOC entry 4752 (class 1259 OID 20369)
-- Name: idx_sale_transactions_buyer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_buyer_id ON public.sale_transactions USING btree (buyer_id);


--
-- TOC entry 4753 (class 1259 OID 20372)
-- Name: idx_sale_transactions_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_created_at ON public.sale_transactions USING btree (created_at);


--
-- TOC entry 4754 (class 1259 OID 20367)
-- Name: idx_sale_transactions_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_product_id ON public.sale_transactions USING btree (product_id);


--
-- TOC entry 4755 (class 1259 OID 20368)
-- Name: idx_sale_transactions_seller_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_seller_id ON public.sale_transactions USING btree (seller_id);


--
-- TOC entry 4756 (class 1259 OID 20370)
-- Name: idx_sale_transactions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_transactions_status ON public.sale_transactions USING btree (status);


--
-- TOC entry 4759 (class 1259 OID 20399)
-- Name: idx_shipments_blockchain_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_blockchain_hash ON public.shipments USING btree (blockchain_hash);


--
-- TOC entry 4760 (class 1259 OID 20400)
-- Name: idx_shipments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_created_at ON public.shipments USING btree (created_at);


--
-- TOC entry 4761 (class 1259 OID 20397)
-- Name: idx_shipments_distributor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_distributor_id ON public.shipments USING btree (distributor_id);


--
-- TOC entry 4762 (class 1259 OID 20396)
-- Name: idx_shipments_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_product_id ON public.shipments USING btree (product_id);


--
-- TOC entry 4763 (class 1259 OID 20398)
-- Name: idx_shipments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_status ON public.shipments USING btree (status);


--
-- TOC entry 4774 (class 1259 OID 20450)
-- Name: idx_system_config_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_config_is_active ON public.system_config USING btree (is_active);


--
-- TOC entry 4775 (class 1259 OID 20449)
-- Name: idx_system_config_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_config_key ON public.system_config USING btree (config_key);


--
-- TOC entry 4780 (class 1259 OID 20467)
-- Name: idx_system_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_action ON public.system_logs USING btree (action);


--
-- TOC entry 4781 (class 1259 OID 20543)
-- Name: idx_system_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_created_at ON public.system_logs USING btree (created_at);


--
-- TOC entry 4782 (class 1259 OID 20469)
-- Name: idx_system_logs_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_entity_id ON public.system_logs USING btree (entity_id);


--
-- TOC entry 4783 (class 1259 OID 20468)
-- Name: idx_system_logs_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_entity_type ON public.system_logs USING btree (entity_type);


--
-- TOC entry 4784 (class 1259 OID 20466)
-- Name: idx_system_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_user_id ON public.system_logs USING btree (user_id);


--
-- TOC entry 4787 (class 1259 OID 20485)
-- Name: idx_user_sessions_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions USING btree (expires_at);


--
-- TOC entry 4788 (class 1259 OID 20484)
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- TOC entry 4727 (class 1259 OID 20262)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4728 (class 1259 OID 20265)
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- TOC entry 4729 (class 1259 OID 20264)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4730 (class 1259 OID 20263)
-- Name: idx_users_wallet_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_wallet_address ON public.users USING btree (wallet_address);


--
-- TOC entry 4814 (class 2620 OID 20491)
-- Name: product_transfers update_product_transfers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_product_transfers_updated_at BEFORE UPDATE ON public.product_transfers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4811 (class 2620 OID 20488)
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4812 (class 2620 OID 20489)
-- Name: sale_transactions update_sale_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sale_transactions_updated_at BEFORE UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4813 (class 2620 OID 20490)
-- Name: shipments update_shipments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4815 (class 2620 OID 20492)
-- Name: system_config update_system_config_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4810 (class 2620 OID 20487)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4808 (class 2606 OID 20525)
-- Name: product_custodies product_custodies_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4809 (class 2606 OID 20530)
-- Name: product_custodies product_custodies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_custodies
    ADD CONSTRAINT product_custodies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4796 (class 2606 OID 20328)
-- Name: product_history product_history_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history
    ADD CONSTRAINT product_history_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4797 (class 2606 OID 20323)
-- Name: product_history product_history_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_history
    ADD CONSTRAINT product_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4803 (class 2606 OID 20419)
-- Name: product_transfers product_transfers_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4804 (class 2606 OID 20414)
-- Name: product_transfers product_transfers_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4805 (class 2606 OID 20424)
-- Name: product_transfers product_transfers_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_transfers
    ADD CONSTRAINT product_transfers_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4795 (class 2606 OID 20278)
-- Name: products products_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4798 (class 2606 OID 20362)
-- Name: sale_transactions sale_transactions_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4799 (class 2606 OID 20352)
-- Name: sale_transactions sale_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4800 (class 2606 OID 20357)
-- Name: sale_transactions sale_transactions_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4801 (class 2606 OID 20391)
-- Name: shipments shipments_distributor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4802 (class 2606 OID 20386)
-- Name: shipments shipments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4806 (class 2606 OID 20461)
-- Name: system_logs system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4807 (class 2606 OID 20479)
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-07-24 12:47:14

--
-- PostgreSQL database dump complete
--

