define(['require',
    'hbs!tmpl/site/header',
    'modules/Vent'
  ], function(require, tmpl, Vent){
  'use strict';

  var vHeader = Marionette.LayoutView.extend({
    template: tmpl,
    templateHelpers: function() {},
    regions: {},
    events: {
      
    },
    initialize: function(options) {
      _.bindAll(this, 'highlightTab');
      this.vent = Vent;
      this.appState = options.appState;
      this.appState.on('change:currentTab', this.highlightTab);
    },
    highlightTab : function(){
      this.$('ul.main-navigation > li a.current').removeClass('current');
      if(this.appState.get('currentTab')){
        this.$('li#tab' + this.appState.get('currentTab') + ' a').addClass('current');
      }
    },
    onRender: function(){
      this.highlightTab();
    }
    
  });
  return vHeader;
});