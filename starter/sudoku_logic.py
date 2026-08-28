import copy
import random

SIZE = 9
EMPTY = 0
MIN_UNIQUE_CLUES = 35
DIFFICULTY_CLUES = {
    'easy': 45,
    'medium': 40,
    'hard': 35,
}
_UNIQUE_TEMPLATE = [
    [5, 3, 4, 6, 7, 8, 9, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True


def _candidates(board, row, col):
    return [num for num in range(1, SIZE + 1) if is_safe(board, row, col, num)]


def count_solutions(board, limit=2):
    """Count valid completions of a board, stopping once ``limit`` is reached."""
    if limit < 1:
        return 0

    full_mask = (1 << SIZE) - 1
    row_masks = [0] * SIZE
    column_masks = [0] * SIZE
    box_masks = [0] * SIZE
    for row in range(SIZE):
        for col in range(SIZE):
            value = board[row][col]
            if value == EMPTY:
                continue
            if not 1 <= value <= SIZE:
                return 0
            bit = 1 << (value - 1)
            box = (row // 3) * 3 + col // 3
            if row_masks[row] & bit or column_masks[col] & bit or box_masks[box] & bit:
                return 0
            row_masks[row] |= bit
            column_masks[col] |= bit
            box_masks[box] |= bit

    def solve(remaining_limit):
        best_cell = None
        best_candidates = 0
        fewest_candidates = SIZE + 1
        for row in range(SIZE):
            for col in range(SIZE):
                if board[row][col] != EMPTY:
                    continue
                box = (row // 3) * 3 + col // 3
                candidates = full_mask & ~(row_masks[row] | column_masks[col] | box_masks[box])
                candidate_count = candidates.bit_count()
                if candidate_count == 0:
                    return 0
                if candidate_count < fewest_candidates:
                    best_cell = (row, col, box)
                    best_candidates = candidates
                    fewest_candidates = candidate_count
                    if candidate_count == 1:
                        break
            if fewest_candidates == 1:
                break

        if best_cell is None:
            return 1

        row, col, box = best_cell
        solutions = 0
        while best_candidates:
            bit = best_candidates & -best_candidates
            best_candidates &= best_candidates - 1
            row_masks[row] |= bit
            column_masks[col] |= bit
            box_masks[box] |= bit
            board[row][col] = bit.bit_length()
            solutions += solve(remaining_limit - solutions)
            board[row][col] = EMPTY
            row_masks[row] ^= bit
            column_masks[col] ^= bit
            box_masks[box] ^= bit
            if solutions >= remaining_limit:
                return solutions
        return solutions

    return solve(limit)


def remove_cells(board, clues):
    """Remove a randomized set of cells until the clue target is reached."""
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)
    for row, col in positions[: SIZE * SIZE - clues]:
        board[row][col] = EMPTY

def generate_puzzle(clues=35, difficulty=None):
    if difficulty is not None:
        try:
            clues = DIFFICULTY_CLUES[difficulty.lower()]
        except (AttributeError, KeyError):
            raise ValueError('difficulty must be Easy, Medium, or Hard')

    if not MIN_UNIQUE_CLUES <= clues <= SIZE * SIZE:
        raise ValueError(f'clues must be between {MIN_UNIQUE_CLUES} and {SIZE * SIZE}')

    puzzle = deep_copy(_UNIQUE_TEMPLATE)
    solution = deep_copy(puzzle)
    fill_board(solution)
    missing_positions = [
        (row, col)
        for row in range(SIZE)
        for col in range(SIZE)
        if puzzle[row][col] == EMPTY
    ]
    random.shuffle(missing_positions)
    for row, col in missing_positions[: clues - sum(cell != EMPTY for row in puzzle for cell in row)]:
        puzzle[row][col] = solution[row][col]
    if count_solutions(puzzle) != 1:
        raise RuntimeError('Unable to generate a unique Sudoku puzzle')
    return puzzle, solution
