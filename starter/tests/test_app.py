import copy

import pytest

from app import CURRENT, app, is_board_solved


@pytest.fixture
def client():
    app.config.update(TESTING=True)
    CURRENT['puzzle'] = None
    CURRENT['solution'] = None
    CURRENT['difficulty'] = 'medium'
    CURRENT['hint_count'] = 0
    CURRENT['active'] = False
    CURRENT['completed'] = False
    CURRENT['elapsed_time'] = 0
    CURRENT['final_time'] = None
    with app.test_client() as test_client:
        yield test_client
    CURRENT['puzzle'] = None
    CURRENT['solution'] = None
    CURRENT['difficulty'] = 'medium'
    CURRENT['hint_count'] = 0
    CURRENT['active'] = False
    CURRENT['completed'] = False
    CURRENT['elapsed_time'] = 0
    CURRENT['final_time'] = None


def test_index_renders_sudoku_page(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'<title>Sudoku Game</title>' in response.data
    assert b'id="sudoku-board"' in response.data


def test_index_includes_theme_toggle_and_theme_root(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'data-theme="light"' in response.data
    assert b'id="theme-toggle"' in response.data
    assert b'aria-label="Toggle dark and light mode"' in response.data


def test_new_game_returns_requested_size_puzzle_and_stores_solution(client):
    response = client.get('/new?clues=40')
    puzzle = response.get_json()['puzzle']

    assert response.status_code == 200
    assert len(puzzle) == 9
    assert all(len(row) == 9 for row in puzzle)
    assert sum(cell != 0 for row in puzzle for cell in row) == 40
    assert CURRENT['solution'] is not None


def test_new_game_generates_requested_difficulty(client):
    response = client.get('/new?difficulty=easy')
    puzzle = response.get_json()['puzzle']

    assert response.status_code == 200
    assert sum(cell != 0 for row in puzzle for cell in row) == 45


def test_new_game_preserves_prefilled_cells_in_solution(client):
    response = client.get('/new?difficulty=hard')
    puzzle = response.get_json()['puzzle']
    solution = CURRENT['solution']

    assert all(
        puzzle[row][col] == solution[row][col]
        for row in range(9)
        for col in range(9)
        if puzzle[row][col] != 0
    )


def test_new_game_rejects_invalid_difficulty(client):
    response = client.get('/new?difficulty=expert')

    assert response.status_code == 400
    assert 'difficulty' in response.get_json()['error']


def test_check_solution_requires_game_in_progress(client):
    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json() == {'error': 'No game in progress'}


def test_new_game_resets_completion_and_state(client):
    client.get('/new?difficulty=easy')

    assert CURRENT['active'] is True
    assert CURRENT['completed'] is False
    assert CURRENT['difficulty'] == 'easy'
    assert CURRENT['hint_count'] == 0
    assert CURRENT['elapsed_time'] == 0


def test_is_board_solved_requires_full_correct_board(client):
    client.get('/new?clues=35')
    solved = copy.deepcopy(CURRENT['solution'])

    assert is_board_solved(solved, CURRENT['solution']) is True

    incomplete = copy.deepcopy(CURRENT['solution'])
    incomplete[0][0] = 0
    assert is_board_solved(incomplete, CURRENT['solution']) is False

    incorrect = copy.deepcopy(CURRENT['solution'])
    incorrect[0][0] = incorrect[0][0] % 9 + 1
    assert is_board_solved(incorrect, CURRENT['solution']) is False


def test_check_solution_reports_no_incorrect_cells_for_solution(client):
    client.get('/new?clues=81')

    response = client.post('/check', json={'board': copy.deepcopy(CURRENT['solution'])})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': []}
    assert CURRENT['completed'] is True


def test_check_solution_reports_incorrect_cell(client):
    client.get('/new?clues=81')
    board = copy.deepcopy(CURRENT['solution'])
    board[0][0] = board[0][0] % 9 + 1

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': [[0, 0]]}


def test_check_solution_ignores_unentered_cells(client):
    client.get('/new?clues=35')
    response = client.post('/check', json={'board': copy.deepcopy(CURRENT['puzzle'])})

    assert response.status_code == 200
    assert response.get_json() == {'incorrect': []}


def test_hint_fills_one_empty_cell_with_solution_value_and_counts_it(client):
    client.get('/new?clues=35')
    board = copy.deepcopy(CURRENT['puzzle'])
    expected = next(
        (row, col)
        for row in range(9)
        for col in range(9)
        if board[row][col] == 0
    )

    response = client.post('/hint', json={'board': board})
    hint = response.get_json()

    assert response.status_code == 200
    assert (hint['row'], hint['col']) == expected
    assert hint['value'] == CURRENT['solution'][expected[0]][expected[1]]
    assert hint['hint_count'] == 1


def test_second_hint_uses_another_empty_cell_and_new_game_resets_count(client):
    client.get('/new?clues=35')
    board = copy.deepcopy(CURRENT['puzzle'])

    first = client.post('/hint', json={'board': board}).get_json()
    board[first['row']][first['col']] = first['value']
    second = client.post('/hint', json={'board': board}).get_json()

    assert (first['row'], first['col']) != (second['row'], second['col'])
    assert second['hint_count'] == 2
    client.get('/new?difficulty=easy')
    assert CURRENT['hint_count'] == 0


def test_hint_does_not_modify_prefilled_cells_or_completed_board(client):
    client.get('/new?clues=35')
    board = copy.deepcopy(CURRENT['puzzle'])
    prefilled = copy.deepcopy(board)

    hint = client.post('/hint', json={'board': board}).get_json()

    assert board == prefilled
    assert board[hint['row']][hint['col']] == 0

    client.get('/new?clues=81')
    board = copy.deepcopy(CURRENT['puzzle'])

    response = client.post('/hint', json={'board': board})

    assert response.get_json()['message'] == 'No empty cells remain.'
    assert response.get_json()['hint_count'] == 0
    assert board == CURRENT['puzzle']