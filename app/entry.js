'use strict';
import $ from 'jquery';
globalThis.jQuery = $;

// テーマを投稿するフォームの切り替え
$('#themeInputSwitch').on('click', function() {
  $(this).hide();
  $('#themeForm').show();
});

// HitoKotoの表示切替
$('.showHitokotoDetail').on('click', function() {
  const theme_id = $(this).data().theme_id
  $(`#HitokotoForm_${theme_id}`).toggle();
  $(`#HitokotoList_${theme_id}`).toggle();
});

// HitoKotoの投稿
$('.createHitokoto').on('click', function() {
  const data = $(this).data();
  $.ajax({
    url: `/theme/${data.theme_id}/hitokoto`,
    type: "POST",
    data: {
      hitokoto: $(`#HitokotoInput_${data.theme_id}`).val(),
      _csrf: data.csrf
    },
    success: function(hitokoto) {
      // リロードしたくないので、投稿に成功したらテンプレをコピーして投稿内容を再現する
      const hitokotoTemplate = $("#Hitokoto_template").clone(true);
      hitokotoTemplate.attr('id', `Hitokoto_${hitokoto.theme.theme_id}`);
      hitokotoTemplate.find('.hitokotoIconLink').attr('href', `https://github.com/${hitokoto.user.username}`);
      hitokotoTemplate.find('.hitokotoIcon').attr('src', `https://avatars.githubusercontent.com/${hitokoto.user.username}`);
      hitokotoTemplate.find('.hitokoto').text(hitokoto.hitokoto);
      hitokotoTemplate.find('.name').text(`by ${hitokoto.user.username}`);
      hitokotoTemplate.find('.starButton').attr({
        'data-theme_id': hitokoto.theme.theme_id,
        'data-hitokoto_id': hitokoto.hitokoto_id
      });
      hitokotoTemplate.find('.deleteHitokoto').attr({
        'data-theme_id': hitokoto.theme.theme_id,
        'data-hitokoto_id': hitokoto.hitokoto_id
      });
      $(`#HitokotoList_${hitokoto.theme.theme_id}`).prepend(hitokotoTemplate);
      hitokotoTemplate.show();

      $(`#HitokotoInput_${data.theme_id}`).val("");
    }
  });
});

// テーマの削除
$('.deleteTheme').on('click', function() {
  if (!confirm('本当に削除しますか？')) return;
  const theme_id = $(this).data().theme_id
  $.ajax({
    url: `/theme/${theme_id}`,
    type: "DELETE",
    data: { _csrf: $(this).data().csrf },
    success: function(msg) {
      $(`#Theme_${theme_id}`).fadeOut();
    }
  });
});

// HitoKotoの削除
$('.deleteHitokoto').on('click', function() {
  if (!confirm('本当に削除しますか？')) return;
  const data = $(this).data();
  $.ajax({
    url: `/hitokoto/${data.hitokoto_id}`,
    type: "DELETE",
    data: { _csrf: $(this).data().csrf },
    success: function(msg) {
      $(`#Hitokoto_${data.hitokoto_id}`).fadeOut();
    }
  });
});

// ★（いいね）の追加＆取り消し
$('.starButton').on('click', function() {
  const $star = $(this);
  const data = $star.data();
  $.ajax({
    url: `/hitokoto/${data.hitokoto_id}/star`,
    type: "POST",
    data: { 
      stared: data.stared,
      _csrf: data.csrf
    },
    success: function(res) {
      $star.data('stared', res.stared);
      $star.children().text(" " + res.starCount);
      $star.toggleClass('btn-outline-primary');
      $star.toggleClass('btn-outline-secondary');
    }
  });
});
