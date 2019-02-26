require 'voom/presenters/dsl/components/menu'
require 'voom/presenters/dsl/components/typography'
require 'voom/presenters/dsl/components/avatar'
require 'voom/presenters/dsl/components/mixins/common'
require 'voom/presenters/dsl/components/mixins/event'
require 'voom/presenters/dsl/components/mixins/attaches'
require 'voom/presenters/dsl/components/mixins/avatar'
require 'voom/presenters/dsl/components/mixins/text_fields'
require 'voom/presenters/dsl/components/mixins/icons'
require 'voom/presenters/dsl/components/mixins/selects'
require 'voom/presenters/dsl/components/mixins/snackbars'
require 'voom/presenters/dsl/components/mixins/date_time_fields'
require 'voom/presenters/dsl/components/mixins/chips'
require 'voom/presenters/dsl/components/mixins/file_inputs'

module Voom
  module Presenters
    module DSL
      module Components
        class Card < EventBase
          include Mixins::Common
          include Mixins::Attaches
          include Mixins::TextFields
          include Mixins::DateTimeFields
          include Mixins::Icons
          include Mixins::Selects
          include Mixins::Snackbars
          include Mixins::Chips
          include Mixins::FileInputs

          attr_reader :height, :width, :selected, :components, :shows_errors


          def initialize(**attribs_, &block)
            super(type: :card, **attribs_, &block)
            @height = attribs.delete(:height)
            @width = attribs.delete(:width)
            @selected = attribs.delete(:selected) {false}
            self.text(attribs.delete(:text)) if attribs.key?(:text)
            @shows_errors = attribs.delete(:shows_errors){true}

            @components = []
            expand!
          end

          def media(**attribs, &block)
            return @media if locked?
            @media = Media.new(parent: self,
                               **attribs, &block)
          end

          class Media < Base
            attr_reader :height, :width, :color, :hidden

            def initialize(**attribs_, &block)
              super(type: :media, **attribs_, &block)
              @height = attribs.delete(:height)
              @width = attribs.delete(:width)
              @color = attribs.delete(:color)
              @hidden = attribs.delete(:hidden){false}

              expand!
            end

            def title(*title, **attribs, &block)
              return @title if locked?
              @title = Typography.new(type: :headline,
                                      level: 6,
                                      parent: self,
                                      text: title,
                                      **attribs, &block)
            end

            def subtitle(*text, **attribs, &block)
              return @subtitle if locked?
              @subtitle = Components::Typography.new(parent: self, type: :subtitle, text: text, **attribs, &block)
            end

            def avatar(avatar = nil, **attribs, &block)
              return @avatar if locked?
              @avatar = Avatar.new(parent: self, avatar: avatar,
                                   **attribs, &block)
            end

            def image(image=nil, **attribs, &block)
              return @image if locked?
              @image = Image.new(parent: self, image: image, **attribs, &block)
            end

            def button(icon=nil, **attributes, &block)
              return @button if locked?
              @button = Components::Button.new(icon: icon, position:[:top, :right], parent: self, **attributes, &block)
            end
          end

          def text(*text, **attribs, &block)
            self << Typography.new(type: :body,
                                   parent: self, text: text, **attribs, &block)
          end

          def actions(**attribs, &block)
            return @actions if locked?
            @actions = Actions.new(parent: self,
                                   **attribs, &block)
          end

          class Actions < Base
            attr_accessor :buttons

            def initialize(**attribs_, &block)
              super(type: :action, **attribs_, &block)
              @buttons = []
              expand!
            end

            def button(text=nil, **options, &block)
              @buttons << Components::Button.new(parent: self, text: text,
                                                 **options, &block)
            end
          end
        end
      end
    end
  end
end
