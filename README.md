# アプリの準備

1. このリポジトリを git clone する
1. GitHub の OAuth アプリ登録をする
1. docker-compose up -d
1. docker-compose exec db bash 
  1. psql
  1. drop database hitokoto
  1. create database hitokoto 
1. docker-compose exec app bash
  1. yarn install
  1. npx webpack
  1. PORT=8000 GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=yyy yarn start