import sudoku_logic


def test_create_empty_board_returns_nine_by_nine_board():
    board = sudoku_logic.create_empty_board()

    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_generate_puzzle_returns_valid_solution_and_requested_clues():
    clues = 35
    puzzle, solution = sudoku_logic.generate_puzzle(clues)

    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert all(sorted(row) == list(range(1, sudoku_logic.SIZE + 1)) for row in solution)
    assert all(
        puzzle[row][col] in (sudoku_logic.EMPTY, solution[row][col])
        for row in range(sudoku_logic.SIZE)
        for col in range(sudoku_logic.SIZE)
    )
    assert sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row) == clues
    assert sudoku_logic.count_solutions(puzzle) == 1

    for row in solution:
        assert sorted(row) == list(range(1, sudoku_logic.SIZE + 1))
    for col in range(sudoku_logic.SIZE):
        assert sorted(solution[row][col] for row in range(sudoku_logic.SIZE)) == list(
            range(1, sudoku_logic.SIZE + 1)
        )
    for box_row in range(0, sudoku_logic.SIZE, 3):
        for box_col in range(0, sudoku_logic.SIZE, 3):
            box = [
                solution[row][col]
                for row in range(box_row, box_row + 3)
                for col in range(box_col, box_col + 3)
            ]
            assert sorted(box) == list(range(1, sudoku_logic.SIZE + 1))


def test_count_solutions_returns_zero_for_invalid_board():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 1
    board[0][1] = 1

    assert sudoku_logic.count_solutions(board) == 0


def test_is_safe_rejects_existing_row_column_and_box_values():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 1

    assert not sudoku_logic.is_safe(board, 0, 1, 1)
    assert not sudoku_logic.is_safe(board, 1, 0, 1)
    assert not sudoku_logic.is_safe(board, 1, 1, 1)
    assert sudoku_logic.is_safe(board, 1, 1, 2)