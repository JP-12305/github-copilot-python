import copy

import pytest

from app import CURRENT, app


@pytest.fixture
def client():
    app.config.update(TESTING=True)
    CURRENT['puzzle'] = None
    CURRENT['solution'] = None
    with app.test_client() as test_client:
        yield test_client
    CURRENT['puzzle'] = None
    CURRENT['solution'] = None


def test_index_renders_sudoku_page(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'<title>Sudoku Game</title>' in response.data
    assert b'id="sudoku-board"' in response.data


def test_new_game_returns_requested_size_puzzle_and_stores_solution(client):
    response = client.get('/new?clues=40')
    puzzle = response.get_json()['puzzle']

    assert response.status_code == 200
    assert len(puzzle) == 9
    assert all(len(row) == 9 for row in puzzle)
    assert sum(cell != 0 for row in puzzle for cell in row) == 40
    assert CURRENT['solution'] is not None


def test_check_solution_requires_game_in_progress(client):
    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json() == {'error': 'No game in progress'}


def test_check_solution_reports_no_incorrect_cells_for_solution(client):
    client.get('/new?clues=81')

    response = client.post('/check', json={'board': copy.deepcopy(CURRENT['solution'])})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': []}


def test_check_solution_reports_incorrect_cell(client):
    client.get('/new?clues=81')
    board = copy.deepcopy(CURRENT['solution'])
    board[0][0] = board[0][0] % 9 + 1

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': [[0, 0]]}