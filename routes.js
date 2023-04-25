const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
    const { id, name, email, phone, membership_date } = req.body;
    if (!name || !email || !phone || !membership_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO LibraryMembers (member_id, name, email, phone, membership_date) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, email=?, phone=?, membership_date=?';
    const values = [id, name, email, phone, membership_date, name, email, phone, membership_date];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while registering the patron' });
            }
            res.status(201).json({ message: 'Patron registered successfully', id: results.insertId });
        });
    });
});

router.get('/patrons', (req, res) => {
    const query = 'SELECT * FROM LibraryMembers';

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while fetching patrons' });
            }
            res.status(200).json(results);
        });
    });
});

router.delete('/patrons/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM LibraryMembers WHERE member_id = ?';

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, id, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while deleting patron' });
            }
            res.status(200).json({ message: 'Patron deleted successfully' });
        });
    });
});


router.get('/books/:filter', (req, res) => {
    const { filter } = req.params;
    query = '';
    if (filter === 'True') {
        console.log('there')
        query = `
    SELECT Books.*, Authors.NAME, Publishers.NAME as publisher_name
    FROM Books 
    INNER JOIN Authors ON Books.author_id = Authors.author_id 
    INNER JOIN Publishers ON Books.publisher_id = Publishers.publisher_id
    WHERE is_loaned = 0
    
`;
    } else {
        console.log('here')
        query = `
        SELECT Books.*, Authors.NAME, Publishers.NAME as publisher_name
        FROM Books 
        INNER JOIN Authors ON Books.author_id = Authors.author_id 
        INNER JOIN Publishers ON Books.publisher_id = Publishers.publisher_id
        
    `;
    }

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while fetching available books' });
            }
            res.status(200).json(results);
        });
    });
});

router.post('/books', (req, res) => {
    const { id, title, author, publisher, publication_year, isbn } = req.body;
    console.log(req.body)
    if (!title || !author || !publisher || !publication_year || !isbn) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO Books (book_id, title, author_id, publisher_id, publication_year, isbn) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=?, author_id=?, publisher_id=?, publication_year=?, isbn=?';
    const values = [id, title, author, publisher, publication_year, isbn, title, author, publisher, publication_year, isbn];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }
        

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while adding the book' });
            }
            res.status(201).json({ message: 'Book added successfully', id: results.insertId });
        });
    });
});

router.delete('/books/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Books WHERE book_id = ?';
    const values = [id];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while removing the book' });
            }
            res.status(200).json({ message: 'Book removed successfully' });
        });
    });
});

router.get('/loans', (req, res) => {
    const query = `
    SELECT
    BookLoans.loan_id AS loan_id,
      Books.book_id AS book_id,
      Books.title,
      LibraryMembers.member_id AS member_id,
      LibraryMembers.name,
      BookLoans.loan_date,
      BookLoans.due_date
    FROM BookLoans
    JOIN Books ON BookLoans.book_id = Books.book_id
    JOIN LibraryMembers ON BookLoans.member_id = LibraryMembers.member_id
    WHERE BookLoans.return_date IS NULL
  `;

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while fetching loans' });
            }
            res.status(200).json(results);
        });
    });
});

router.post('/loans', (req, res) => {
    const { id, book_id, member_id, loan_date, due_date } = req.body;
    const query = 'INSERT INTO BookLoans (loan_id, book_id, member_id, loan_date, due_date) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE book_id=?, member_id=?, loan_date=?, due_date=?';

    const values = [id, book_id, member_id, loan_date, due_date, book_id, member_id, loan_date, due_date];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while creating a loan' });
            }
        });
    });

    const query2 = 'UPDATE Books SET is_loaned = 1 WHERE book_id = ?';
    const values2 = [book_id];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query2, values2, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while updating the book' });
            }
            res.status(200).json({ message: 'Book updated successfully' });
        });
    }
    );


});

router.put('/loans/:id', (req, res) => {
    const { id } = req.params;
    const { return_date } = req.body;
    const query = 'UPDATE BookLoans SET return_date = ? WHERE loan_id = ?';
    const values = [return_date, id];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while updating the loan' });
            }
            res.status(200).json({ message: 'Loan updated successfully' });
        });
    });
});

router.get('/publishers', (req, res) => {
    const query = 'SELECT * FROM Publishers';

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while fetching publishers' });
            }
            res.status(200).json(results);
        });
    });
});

router.post('/publishers', (req, res) => {
    const { id, name, address, contact_email } = req.body;
    if (!name || !address || !contact_email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO Publishers (publisher_id, name, address, contact_email) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, address=?, contact_email=?';
    const values = [id, name, address, contact_email, name, address, contact_email];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while adding the publisher' });
            }
            res.status(201).json({ message: 'Publisher added successfully', id: results.insertId });
        });
    });
});

router.delete('/publishers/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Publishers WHERE publisher_id = ?';
    const values = [id];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while removing the publisher' });
            }
            res.status(200).json({ message: 'Publisher removed successfully' });
        });
    });
});

router.get('/authors', (req, res) => {
    const query = 'SELECT * FROM Authors';

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while fetching authors' });
            }
            res.status(200).json(results);
        });
    });
});

router.post('/authors', (req, res) => {
    const { id, name, birth_year, nationality } = req.body;
    console.log(req.body)
    if (!name || !birth_year || !nationality) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = 'INSERT INTO Authors (author_id, name, birth_year, nationality) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, birth_year=?, nationality=?';
    const values = [id, name, birth_year, nationality, name, birth_year, nationality];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });

        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while adding the author' });
            }
            res.status(201).json({ message: 'Author added successfully', id: results.insertId });
        });
    });
});

router.delete('/authors/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Authors WHERE author_id = ?';
    const values = [id];

    req.pool.getConnection((error, connection) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'An error occurred while getting a connection from the pool' });
        }

        connection.query(query, values, (error, results) => {
            connection.release();

            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'An error occurred while removing the author' });
            }
            res.status(200).json({ message: 'Author removed successfully' });
        });
    });
});



module.exports = router;

