# HitoKoto について
色々な物事を「一言」で表現してみるソーシャルサービスです。

このアプリケーションはN予備校プログラミングコース冬のWebアプリコンテストのサンプル作品です。
- [N予備校プログラミングコース](https://www.nnn.ed.nico/pages/programming/)
- [N予備校プログラミングコンテスト](https://progedu.github.io/webappcontest/)

# ライセンス
本ソフトウェアは、[MITライセンス](https://github.com/tokyo-metropolitan-gov/covid19/blob/development/LICENSE.txt)の元提供されています。

# アプリ開発について
[N予備校2021年度版プログラミング入門コース](https://www.nnn.ed.nico/pages/programming/)で学ぶDocker環境の利用が前提となっています。

## 環境構築
以下の手順でアプリケーションサーバーを立ち上げてください。

1. このリポジトリを git clone する
1. GitHub の OAuth アプリ登録をする
1. docker-compose up -d
1. docker-compose exec db bash 
  1. psql
  1. create database hitokoto 
1. docker-compose exec app bash
  1. yarn install
  1. npx webpack
  1. PORT=8000 GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=yyy yarn start

## 開発環境アプリへのアクセス
サーバーが立ち上がったら、以下のURLにアクセスします。
http://localhost:8000

## 利用規約およびプライバシーポリシー
以下をご覧ください。

[HitoKoto利用規約およびプライバシーポリシー](https://github.com/kuriko/HitoKoto/blob/main/Terms_and_Policies.md)