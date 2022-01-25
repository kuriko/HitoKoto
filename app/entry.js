'use strict';
import $ from 'jquery';
globalThis.jQuery = $;
import bootstrap from 'bootstrap';

$('#themeInputSwitch').on('click', function() {
  $(this).hide();
  $('#themeForm').show();
});

$('.showHitokotoDetail').on('click', function() {
  const theme_id = $(this).data().theme_id
  $(`#HitokotoForm_${theme_id}`).toggle();
  $(`#HitokotoList_${theme_id}`).toggle();
});

$('.createTheme').on('click', function() {
  const data = $(this).data();
  $.ajax({
    url: `/theme`,
    type: "POST",
    data: {
      theme: $('#themeInput').val(),
      _csrf: data.csrf
    },
    success: function(msg) {
      console.log(msg);
    }
  });
});

$('.createHitokoto').on('click', function() {
  const data = $(this).data();
  $.ajax({
    url: `/theme/${data.theme_id}/hitokoto`,
    type: "POST",
    data: {
      hitokoto: $(`#HitokotoInput_${data.theme_id}`).val(),
      _csrf: data.csrf
    },
    success: function(msg) {
      console.log(msg);
    }
  });
});

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

$('.deleteHitokoto').on('click', function() {
  if (!confirm('本当に削除しますか？')) return;
  const hitokoto_id = $(this).data().hitokoto_id
  $.ajax({
    url: `/hitokoto/${hitokoto_id}`,
    type: "DELETE",
    data: { _csrf: $(this).data().csrf },
    success: function(msg) {
      $(`#Hitokoto_${hitokoto_id}`).fadeOut();
    }
  });
});

/**
$('.availability-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const scheduleId = button.data('schedule-id');
    const userId = button.data('user-id');
    const candidateId = button.data('candidate-id');
    const availability = parseInt(button.data('availability'));
    const nextAvailability = (availability + 1) % 3;
    $.post(`/schedules/${scheduleId}/users/${userId}/candidates/${candidateId}`,
      { availability: nextAvailability },
      (data) => {
        button.data('availability', data.availability);
        const availabilityLabels = ['欠', '？', '出'];
        button.text(availabilityLabels[data.availability]);

        const buttonStyles = ['btn-danger', 'btn-secondary', 'btn-success'];
        button.removeClass('btn-danger btn-secondary btn-success');
        button.addClass(buttonStyles[data.availability]);
      });
  });
});

const buttonSelfComment = $('#self-comment-button');
buttonSelfComment.click(() => {
  const scheduleId = buttonSelfComment.data('schedule-id');
  const userId = buttonSelfComment.data('user-id');
  const comment = prompt('コメントを255文字以内で入力してください。');
  if (comment) {
    $.post(`/schedules/${scheduleId}/users/${userId}/comments`,
      { comment: comment },
      (data) => {
        $('#self-comment').text(data.comment);
      });
  }
});
 */