class ExtensionDefinition < ActiveRecord::Base
  include SingularTable

  has_many :extension_records, foreign_key: "definition_id", inverse_of: :extension_definition
  has_many :entities, through: :extension_records, inverse_of: :extension_definitions  

  PERSON_ID = 1
  ORG_ID = 2

  
  def self.person_types
    where(parent_id: PERSON_ID)
  end

  def self.org_types
    where(parent_id: ORG_ID)
  end

end
