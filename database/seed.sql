-- Research Publication Management System Seed script
-- Topic: AI & Computer Science
-- Warning: This script deletes existing data before seeding.

BEGIN;

-- 1. Reset Tables safely
TRUNCATE TABLE paper_funding CASCADE;
TRUNCATE TABLE funding_agencies CASCADE;
TRUNCATE TABLE citations CASCADE;
TRUNCATE TABLE paperauthors CASCADE;
TRUNCATE TABLE papers CASCADE;
TRUNCATE TABLE journals CASCADE;
TRUNCATE TABLE authors CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset all auto-incrementing serial IDs back to 1
ALTER SEQUENCE citations_citation_id_seq RESTART WITH 1;
ALTER SEQUENCE funding_agencies_agency_id_seq RESTART WITH 1;
ALTER SEQUENCE papers_paper_id_seq RESTART WITH 1;
ALTER SEQUENCE journals_journal_id_seq RESTART WITH 1;
ALTER SEQUENCE authors_author_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- 2. Create Users
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$Q8g1lKHz8H4T8xLg0O5fJ.qR5qZ1LzPzQzQzQzQzQzQzQzQzQzQzQ', 'Administrator'),
('Research Scholar', 'researcher@example.com', '$2b$10$Q8g1lKHz8H4T8xLg0O5fJ.qR5qZ1LzPzQzQzQzQzQzQzQzQzQzQzQ', 'Researcher');

-- 3. Create Authors (1 to 10)
INSERT INTO authors (name, orcid, affiliation, department, email, research_interests) VALUES
('Geoffrey Hinton', '0000-0000-0000-0001', 'University of Toronto', 'Computer Science', 'hinton@toronto.example.com', 'Deep Learning, Neural Networks'),
('Yann LeCun', '0000-0000-0000-0002', 'New York University', 'Data Science', 'yann@nyu.example.edu', 'Machine Learning, Computer Vision'),
('Yoshua Bengio', '0000-0000-0000-0003', 'University of Montreal', 'Computer Science', 'bengio@umontreal.example.ca', 'Natural Language Processing, Deep Learning'),
('Ilya Sutskever', '0000-0000-0000-0004', 'OpenAI', 'Research', 'ilya@openai.example.com', 'Generative Models, Sequence Learning'),
('Ashish Vaswani', '0000-0000-0000-0005', 'Google Brain', 'AI Research', 'vaswani@google.example.com', 'Transformers, NLP'),
('Noam Shazeer', '0000-0000-0000-0006', 'Google Brain', 'AI Research', 'shazeer@google.example.com', 'Language Modeling, NLP'),
('Kaiming He', '0000-0000-0000-0007', 'Facebook AI Research', 'Vision', 'kaiming@fb.example.com', 'Computer Vision, Residual Networks'),
('Xiangyu Zhang', '0000-0000-0000-0008', 'Megvii', 'Research', 'xiangyu@megvii.example.com', 'Deep Learning, Vision'),
('Shaoqing Ren', '0000-0000-0000-0009', 'NIO', 'Autonomous Driving', 'shaoqing@nio.example.com', 'Object Detection'),
('Jian Sun', '0000-0000-0000-0010', 'Megvii', 'Research', 'jian@megvii.example.com', 'Visual Recognition');

-- 4. Create Journals
INSERT INTO journals (name, publisher) VALUES
('Journal of Machine Learning Research', 'JMLR'),
('Nature', 'Nature Publishing Group'),
('IEEE Transactions on Pattern Analysis and Machine Intelligence', 'IEEE');

-- 5. Create Papers (1 to 12)
INSERT INTO papers (title, abstract, doi, publication_year, journal_id, journal, conference, keywords, pdf_url) VALUES
(
  'Attention Is All You Need', 
  'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.', 
  '10.48550/arXiv.1706.03762', 
  2017, 
  1, 
  'Advances in Neural Information Processing Systems', 
  'NeurIPS', 
  'Transformer, Attention, NLP', 
  'https://arxiv.org/pdf/1706.03762'
),
(
  'Deep Residual Learning for Image Recognition',
  'We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.',
  '10.1109/CVPR.2016.90',
  2016,
  3,
  'IEEE Conference on Computer Vision and Pattern Recognition',
  'CVPR',
  'ResNet, Computer Vision, CNN',
  'https://arxiv.org/pdf/1512.03385'
),
(
  'Sequence to Sequence Learning with Neural Networks',
  'Deep Neural Networks are powerful models that have achieved excellent performance on difficult learning tasks. Although DNNs work well whenever large labeled training sets are available, they cannot be used to map sequences to sequences.',
  '10.48550/arXiv.1409.3215',
  2014,
  1,
  'Advances in Neural Information Processing Systems',
  'NeurIPS',
  'Seq2Seq, RNN, Machine Translation',
  'https://arxiv.org/pdf/1409.3215'
),
(
  'Gradient-based learning applied to document recognition',
  'Multilayer neural networks trained with the back-propagation algorithm constitute the best example of a successful gradient based learning technique. Given an appropriate network architecture, gradient-based learning algorithms can be used to synthesize a complex decision surface.',
  '10.1109/5.726791',
  1998,
  3,
  'Proceedings of the IEEE',
  NULL,
  'CNN, Handwriting, LeNet',
  'http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf'
),
(
  'Imagenet classification with deep convolutional neural networks',
  'We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest into the 1000 different classes. On the test data, we achieved top-1 and top-5 error rates of 37.5% and 17.0% respectively.',
  '10.1145/3065386',
  2012,
  1,
  'Advances in Neural Information Processing Systems',
  'NeurIPS',
  'AlexNet, ImageNet, CNN',
  'https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf'
),
(
  'Generative Adversarial Nets',
  'We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G.',
  '10.48550/arXiv.1406.2661',
  2014,
  1,
  'Advances in Neural Information Processing Systems',
  'NeurIPS',
  'GAN, Generative Models',
  'https://arxiv.org/pdf/1406.2661'
),
(
  'Deep learning',
  'Deep learning allows computational models that are composed of multiple processing layers to learn representations of data with multiple levels of abstraction. These methods have dramatically improved the state-of-the-art in speech recognition, visual object recognition, object detection.',
  '10.1038/nature14539',
  2015,
  2,
  'Nature',
  NULL,
  'Deep Learning, Review, AI',
  'https://www.nature.com/articles/nature14539'
),
(
  'Language Models are Few-Shot Learners',
  'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples.',
  '10.48550/arXiv.2005.14165',
  2020,
  1,
  'Advances in Neural Information Processing Systems',
  'NeurIPS',
  'GPT-3, LLM, Few-Shot',
  'https://arxiv.org/pdf/2005.14165'
),
(
  'A Neural Probabilistic Language Model',
  'A goal of statistical language modeling is to learn the joint probability function of sequences of words in a language. This is intrinsically difficult because of the curse of dimensionality.',
  '10.1162/153244303322533223',
  2003,
  1,
  'Journal of Machine Learning Research',
  NULL,
  'Language Model, Word Embeddings',
  'https://www.jmlr.org/papers/volume3/bengio03a/bengio03a.pdf'
),
(
  'BERT: Pre-training of Deep Bidirectional Transformers',
  'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text.',
  '10.48550/arXiv.1810.04805',
  2018,
  1,
  'NAACL-HLT',
  'NAACL',
  'BERT, Transformer, NLP',
  'https://arxiv.org/pdf/1810.04805'
);

-- 6. Link Papers to Authors (many-to-many bridge)
INSERT INTO paperauthors (paper_id, author_id) VALUES
-- Attention Is All You Need: Vaswani, Shazeer
(1, 5), (1, 6),
-- ResNet: He, Zhang, Ren, Sun
(2, 7), (2, 8), (2, 9), (2, 10),
-- Seq2Seq: Sutskever, Hinton
(3, 4), (3, 1),
-- LeNet/Gradient-based: LeCun, Bengio (Mocking co-authorship for demo)
(4, 2), (4, 3),
-- ImageNet: Sutskever, Hinton (Proxying AlexNet team)
(5, 4), (5, 1),
-- GAN: Bengio (Mocking Ian Goodfellow's paper)
(6, 3), 
-- Deep Learning Review: LeCun, Bengio, Hinton
(7, 2), (7, 3), (7, 1),
-- GPT-3: Sutskever (Proxying OpenAI team)
(8, 4),
-- Neural Prob. Language Model: Bengio
(9, 3),
-- BERT: Vaswani (Proxying researchers interacting with Transformers)
(10, 5);

-- 7. Add Citations (citing_paper_id -> cited_paper_id)
INSERT INTO citations (citing_paper_id, cited_paper_id) VALUES
-- Transformer (1) cites Seq2Seq (3) and Neural Prob Model (9)
(1, 3), (1, 9),
-- ResNet (2) cites LeNet (4) and ImageNet (5)
(2, 4), (2, 5),
-- Seq2Seq (3) cites Neural Prob Model (9)
(3, 9),
-- ImageNet (5) cites LeNet (4)
(5, 4),
-- GAN (6) cites Deep Learning Review (7)
(6, 7),
-- DL Review (7) cites LeNet (4), ImageNet (5), and Seq2Seq (3)
(7, 4), (7, 5), (7, 3),
-- GPT-3 (8) cites Transformer (1) and BERT (10)
(8, 1), (8, 10),
-- BERT (10) cites Transformer (1) and Seq2Seq (3)
(10, 1), (10, 3);

-- 8. Create Funding Agencies
INSERT INTO funding_agencies (name, type, location) VALUES
('National Science Foundation', 'Government', 'United States'),
('Defense Advanced Research Projects Agency (DARPA)', 'Government', 'United States'),
('European Research Council', 'Government', 'Europe'),
('Google Research', 'Corporate', 'Global');

-- 9. Link Papers to Funding
INSERT INTO paper_funding (paper_id, agency_id, amount, grant_number) VALUES
(1, 4, 1500000.00, 'GR-2017-X1'),
(2, 4, 500000.00, 'GR-2016-CV'),
(4, 2, 250000.00, 'DARPA-98-001'),
(7, 3, 1200000.00, 'ERC-2015-DL'),
(8, 4, 3000000.00, 'GR-2020-LLM');

COMMIT;
