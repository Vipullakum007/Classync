package com.classync.project.services.impl;

import com.classync.project.controllers.UserController.UserDetails;
import com.classync.project.dao.ClassroomDAO;
import com.classync.project.dao.UserDAO;
import com.classync.project.dao.UserClassroomDAO;
import com.classync.project.entity.Classroom;
import com.classync.project.entity.User;
import com.classync.project.entity.UserClassroom;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ClassroomService {

    private final ClassroomDAO classroomDAO;
    private final UserDAO userDAO;
    private final UserClassroomDAO userClassroomDAO;

    public ClassroomService(ClassroomDAO classroomDAO, UserDAO userDAO, UserClassroomDAO userClassroomDAO) {
        this.classroomDAO = classroomDAO;
        this.userDAO = userDAO;
        this.userClassroomDAO = userClassroomDAO;
    }

    public Classroom createClass(String className, String useremail) {

        Classroom classroom = new Classroom();
        classroom.setClassName(className);
        classroomDAO.save(classroom);
        joinClass(classroom.getClassroomCode(), useremail);
        return classroom;
    }

    public Classroom joinClass(String classroomCode, String useremail) {

        Optional<Classroom> classroomOpt = classroomDAO.findByClassroomCode(classroomCode);

        if (classroomOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid classroom code");
        }
        if (useremail == null) {
            throw new IllegalStateException("User is not authenticated");
        }

        Classroom classroom = classroomOpt.get();
        Optional<User> optUser = userDAO.findByEmail(useremail);
        User user = optUser.orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<UserClassroom> existingEntry = userClassroomDAO.findByUserAndClassroom(user, classroom);
        if (existingEntry.isPresent()) {
            throw new IllegalArgumentException("User is already a member of this classroom");
        }

        // Create a new entry in the userClassroom table
        UserClassroom userClassroom = new UserClassroom();
        userClassroom.setUser(user);
        userClassroom.setClassroom(classroom);

        userClassroomDAO.save(userClassroom);

        return classroom;
    }
}
