from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)


def is_board_solved(board, solution):
    if board is None or solution is None:
        return False
    if len(board) != sudoku_logic.SIZE or len(solution) != sudoku_logic.SIZE:
        return False
    for row in range(sudoku_logic.SIZE):
        if len(board[row]) != sudoku_logic.SIZE or len(solution[row]) != sudoku_logic.SIZE:
            return False
        for col in range(sudoku_logic.SIZE):
            if board[row][col] == sudoku_logic.EMPTY:
                return False
            if board[row][col] != solution[row][col]:
                return False
    return True


# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None,
    'difficulty': 'medium',
    'hint_count': 0,
    'active': False,
    'completed': False,
    'elapsed_time': 0,
    'final_time': None
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty')
    try:
        clues = int(request.args.get('clues', 35))
        if difficulty is None:
            puzzle, solution = sudoku_logic.generate_puzzle(clues)
        else:
            puzzle, solution = sudoku_logic.generate_puzzle(clues, difficulty)
    except (TypeError, ValueError) as error:
        return jsonify({'error': str(error)}), 400
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = (difficulty or 'medium').lower()
    CURRENT['hint_count'] = 0
    CURRENT['active'] = True
    CURRENT['completed'] = False
    CURRENT['elapsed_time'] = 0
    CURRENT['final_time'] = None
    return jsonify({'puzzle': puzzle, 'difficulty': CURRENT['difficulty']})


@app.route('/hint', methods=['POST'])
def provide_hint():
    data = request.json or {}
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    if CURRENT.get('completed'):
        return jsonify({
            'hint_count': CURRENT['hint_count'],
            'message': 'The puzzle is already complete.'
        })
    for row in range(sudoku_logic.SIZE):
        for col in range(sudoku_logic.SIZE):
            if board[row][col] == sudoku_logic.EMPTY:
                CURRENT['hint_count'] += 1
                return jsonify({
                    'row': row,
                    'col': col,
                    'value': solution[row][col],
                    'hint_count': CURRENT['hint_count']
                })

    return jsonify({
        'hint_count': CURRENT['hint_count'],
        'message': 'No empty cells remain.'
    })


@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json or {}
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400

    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != 0 and board[i][j] != solution[i][j]:
                incorrect.append([i, j])

    completed = is_board_solved(board, solution)
    if completed:
        CURRENT['completed'] = True
        CURRENT['active'] = False
        CURRENT['final_time'] = CURRENT.get('elapsed_time')
    else:
        CURRENT['completed'] = False
        CURRENT['active'] = bool(CURRENT.get('puzzle') is not None)

    return jsonify({'incorrect': incorrect})


if __name__ == '__main__':
    app.run(debug=True)