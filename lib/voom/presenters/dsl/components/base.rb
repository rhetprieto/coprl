require_relative '../lockable'
require_relative '../../../serializer'
require_relative '../../../trace'

require 'securerandom'

module Voom
  module Presenters
    module DSL
      module Components
        # Every object in the POM is a node
        # This class provides common base implementation
        class Base
          include Lockable

          include Voom::Serializer
          include LoggerMethods
          include Trace

          attr_reader :type, :id, :attributes, :context
          private :context

          alias params context
          alias attribs attributes

          def initialize(type:, parent:, id: nil, context: {}, **attributes, &block)
            @id = h(id) || generate_id
            @type = h(type)
            @parent = parent
            @context = context
            @attributes = escape(attributes)
            @block = block
          end

          def expand!
            extend(_helpers_) if _helpers_
            instance_eval(&@block) if @block
          end

          private

          def h(text)
            return text unless text.is_a? String
            CGI::escapeHTML(text)
          end

          def escape(attributes)
            attributes.map {|k, v| [k, h(v)]}.to_h
          end

          def generate_id
            Voom::Presenters::Settings.config.presenters.id_generator.call(self)
          end
      
          protected

          def parent(for_type)
            return @parent if @parent.type == for_type
            @parent.send(:parent, for_type)
          end

          def router
            @parent.send(:router)
          end

          def yield_block
            return @_yield_block_ if @_yield_block_
            @parent.send(:yield_block)
          end

          def _helpers_
            @parent.send(:_helpers_) if @parent
          end

        end
      end
    end
  end
end
