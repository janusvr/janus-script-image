room.extendElement('object', 'captionedimage', {
  image_id: '',
  caption: '',

  createChildren: function() {
    this.captionobject = this.createObject('text', {
      pos: V(0,-.5,.2),
      text: this.caption,
      col: 'red'
    });
    this.image = this.createObject('image', {
      image_id: this.image_id
    });
  }
});

