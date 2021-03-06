require 'net/http'

class Chat
  API_URL = APP_CONFIG['chat']['api_url']
  USERNAME = APP_CONFIG['chat']['admin_username']
  PASSWORD = APP_CONFIG['chat']['admin_password']

  def initialize
    @admin_token = nil
    @admin_id = nil
  end

  def create_user(user)
    return nil unless user.chatid.blank?
    res = post '/api/v1/users.create', user_payload(user), auth_headers
    if res && res.fetch('success') == true
      mongo_chat_id = res['user']['_id']
      user.update(chatid: mongo_chat_id)
      Rails.logger.info "Created chat account for user #{user.id}. Mongo id: #{mongo_chat_id}"
    else
      Rails.logger.warn "Failed to create chat account for user #{user.id}"
    end
  end

  def info
    get '/api/v1/info'
  end

  def admin_login
    res = post '/api/v1/login', username: USERNAME, password: PASSWORD
    if res.present? && res.fetch('status', '') == 'success'
      @admin_token = res['data'].fetch('authToken')
      @admin_id = res['data'].fetch('userId')
    end
  end

  def admin_logout
    res = get '/api/v1/logout', auth_headers
    if res
      @admin_token = nil
      @admin_id = nil
    end
  end

  ##  CLASS METHODS  ##

  #  Str (Mongo ID of user) => Hash
  # Creates new iframe token for the user, updates the mongo record, and returns a hash with the token
  def self.login_token(mongo_id)
    return nil if mongo_id.blank?
    mongo = mongo_client
    users = mongo['users']
    token = SecureRandom.urlsafe_base64(30)
    users.find_one_and_update({ _id: mongo_id }, { "$set" => { services: { iframe: { token: token } } } }, :return_document => :after, :upsert => false)
    mongo.close
    { "token" => token }
  end

  # returns Mongo::Client connected to db 'rocketchat'
  private_class_method def self.mongo_client
    Mongo::Client.new([APP_CONFIG['chat']['mongo_url']], :database => 'rocketchat')
  end

  private

  def auth_headers
    {'X-Auth-Token' => @admin_token, 'X-User-Id' => @admin_id }
  end

  def user_payload(user)
    {
      'email' => user.email,
      'name' => user.username,
      'password' => SecureRandom.urlsafe_base64(20),
      'username' => user.username,
      'verified' => true
    }
  end

  # str, hash, hash => json | nil
  def post(route, data, headers = nil)
    uri = path_to_uri route
    req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    add_headers(req, headers) unless headers.blank?
    req.body = data.to_json
    success_check Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(req) }
  end

  def get(route, headers = nil)
    uri = path_to_uri route
    req = Net::HTTP::Get.new(uri)
    add_headers(req, headers) unless headers.blank?
    success_check(Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(req) })
  end

  def add_headers(req, headers)
    headers.each { |key, val| req[key] = val }
  end

  # str -> <URI>
  def path_to_uri(path)
    URI("#{API_URL}#{path}")
  end

  # <NetResponce> -> json | nil
  def success_check(res)
    return JSON.parse(res.body) if res.is_a?(Net::HTTPSuccess)
    Rails.logger.debug "Chat API request failed: #{res.inspect}"
    Rails.logger.debug "Failed response: #{res.body}"
    nil
  end
end
