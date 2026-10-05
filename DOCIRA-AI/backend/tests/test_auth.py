def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "email": "new@test.com",
        "full_name": "New User",
        "password": "password123",
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@test.com"


def test_register_duplicate_email(client, test_user):
    res = client.post("/api/auth/register", json={
        "email": "test@documind.ai",
        "full_name": "Dup User",
        "password": "password123",
    })
    assert res.status_code == 400
    assert "already registered" in res.json()["message"].lower()


def test_login_success(client, test_user):
    res = client.post("/api/auth/login", json={
        "email": "test@documind.ai",
        "password": "password123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client, test_user):
    res = client.post("/api/auth/login", json={
        "email": "test@documind.ai",
        "password": "wrongpass",
    })
    assert res.status_code == 401


def test_get_me_authenticated(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test@documind.ai"


def test_get_me_unauthenticated(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 403


def test_update_profile(client, auth_headers):
    res = client.put("/api/auth/profile", json={"full_name": "Updated Name"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["full_name"] == "Updated Name"